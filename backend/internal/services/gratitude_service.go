package services

import (
	"aa-sharing-backend/internal/models"

	"gorm.io/gorm"
)

type GratitudeService struct {
	db *gorm.DB
}

func NewGratitudeService(db *gorm.DB) *GratitudeService {
	return &GratitudeService{db: db}
}

func (s *GratitudeService) CreateGratitude(gratitude *models.GratitudeEntry) error {
	return s.db.Create(gratitude).Error
}

func (s *GratitudeService) GetUserGratitude(userID uint) ([]models.GratitudeEntry, error) {
	var gratitudes []models.GratitudeEntry
	if err := s.db.Where("user_id = ?", userID).
		Preload("User").
		Preload("Partnership").
		Order("created_at DESC").
		Find(&gratitudes).Error; err != nil {
		return nil, err
	}
	return gratitudes, nil
}

func (s *GratitudeService) GetPartnershipGratitude(partnershipID uint) ([]models.GratitudeEntry, error) {
	var gratitudes []models.GratitudeEntry
	if err := s.db.Where("partnership_id = ?", partnershipID).
		Preload("User").
		Preload("Partnership").
		Order("created_at DESC").
		Find(&gratitudes).Error; err != nil {
		return nil, err
	}
	return gratitudes, nil
}

func (s *GratitudeService) UpdateGratitude(id uint, updates map[string]interface{}) error {
	return s.db.Model(&models.GratitudeEntry{}).Where("id = ?", id).Updates(updates).Error
}

func (s *GratitudeService) DeleteGratitude(id uint) error {
	return s.db.Delete(&models.GratitudeEntry{}, id).Error
}