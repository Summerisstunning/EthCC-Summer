package services

import (
	"aa-sharing-backend/internal/models"
	"time"

	"gorm.io/gorm"
)

type WalletService struct {
	db *gorm.DB
}

func NewWalletService(db *gorm.DB) *WalletService {
	return &WalletService{db: db}
}

func (s *WalletService) GetWalletBalance(partnershipID uint) (*models.WalletBalance, error) {
	var balance models.WalletBalance
	if err := s.db.Where("partnership_id = ?", partnershipID).
		Preload("Partnership").
		First(&balance).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// Create new wallet balance if not exists
			balance = models.WalletBalance{
				PartnershipID: partnershipID,
				Balance:       0,
				LastUpdated:   time.Now(),
			}
			if err := s.db.Create(&balance).Error; err != nil {
				return nil, err
			}
		} else {
			return nil, err
		}
	}
	return &balance, nil
}

func (s *WalletService) UpdateBalance(partnershipID uint, amount float64) error {
	return s.db.Transaction(func(tx *gorm.DB) error {
		var balance models.WalletBalance
		if err := tx.Where("partnership_id = ?", partnershipID).First(&balance).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				balance = models.WalletBalance{
					PartnershipID: partnershipID,
					Balance:       amount,
					LastUpdated:   time.Now(),
				}
				return tx.Create(&balance).Error
			}
			return err
		}

		balance.Balance += amount
		balance.LastUpdated = time.Now()
		return tx.Save(&balance).Error
	})
}

func (s *WalletService) CreateTransaction(transaction *models.Transaction) error {
	return s.db.Transaction(func(tx *gorm.DB) error {
		// Create transaction record
		if err := tx.Create(transaction).Error; err != nil {
			return err
		}

		// Update wallet balance
		if transaction.Type == "gratitude" || transaction.Type == "contribution" {
			return s.UpdateBalance(transaction.PartnershipID, transaction.Amount)
		}

		return nil
	})
}

func (s *WalletService) GetTransactions(partnershipID uint) ([]models.Transaction, error) {
	var transactions []models.Transaction
	if err := s.db.Where("partnership_id = ?", partnershipID).
		Preload("User").
		Preload("Partnership").
		Order("created_at DESC").
		Find(&transactions).Error; err != nil {
		return nil, err
	}
	return transactions, nil
}

func (s *WalletService) CreateGoal(goal *models.Goal) error {
	return s.db.Create(goal).Error
}

func (s *WalletService) GetGoals(partnershipID uint) ([]models.Goal, error) {
	var goals []models.Goal
	if err := s.db.Where("partnership_id = ?", partnershipID).
		Preload("Partnership").
		Order("created_at DESC").
		Find(&goals).Error; err != nil {
		return nil, err
	}
	return goals, nil
}

func (s *WalletService) UpdateGoal(id uint, updates map[string]interface{}) error {
	return s.db.Model(&models.Goal{}).Where("id = ?", id).Updates(updates).Error
}

func (s *WalletService) SplitFunds(partnershipID uint) error {
	return s.db.Transaction(func(tx *gorm.DB) error {
		// Get current balance
		var balance models.WalletBalance
		if err := tx.Where("partnership_id = ?", partnershipID).First(&balance).Error; err != nil {
			return err
		}

		// Split amount
		splitAmount := balance.Balance / 2

		// Get partnership details
		var partnership models.Partnership
		if err := tx.Preload("UserA").Preload("UserB").First(&partnership, partnershipID).Error; err != nil {
			return err
		}

		// Create split transactions
		transactions := []models.Transaction{
			{
				UserID:        partnership.UserAID,
				PartnershipID: partnershipID,
				Type:          "split",
				Amount:        splitAmount,
				Description:   "Balance split",
				Status:        "confirmed",
			},
			{
				UserID:        partnership.UserBID,
				PartnershipID: partnershipID,
				Type:          "split",
				Amount:        splitAmount,
				Description:   "Balance split",
				Status:        "confirmed",
			},
		}

		for _, transaction := range transactions {
			if err := tx.Create(&transaction).Error; err != nil {
				return err
			}
		}

		// Reset balance
		balance.Balance = 0
		balance.LastUpdated = time.Now()
		if err := tx.Save(&balance).Error; err != nil {
			return err
		}

		// Update partnership status
		return tx.Model(&partnership).Update("status", "split").Error
	})
}