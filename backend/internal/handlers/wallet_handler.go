package handlers

import (
	"net/http"
	"strconv"

	"aa-sharing-backend/internal/models"
	"aa-sharing-backend/internal/services"

	"github.com/gin-gonic/gin"
)

type WalletHandler struct {
	walletService *services.WalletService
}

func NewWalletHandler(walletService *services.WalletService) *WalletHandler {
	return &WalletHandler{walletService: walletService}
}

func (h *WalletHandler) GetWalletBalance(c *gin.Context) {
	partnershipID, err := strconv.ParseUint(c.Param("partnershipId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid partnership ID"})
		return
	}

	balance, err := h.walletService.GetWalletBalance(uint(partnershipID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, balance)
}

func (h *WalletHandler) Contribute(c *gin.Context) {
	var req struct {
		UserID        uint    `json:"user_id" binding:"required"`
		PartnershipID uint    `json:"partnership_id" binding:"required"`
		Amount        float64 `json:"amount" binding:"required"`
		Description   string  `json:"description"`
		Type          string  `json:"type" binding:"required"` // gratitude or contribution
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	transaction := models.Transaction{
		UserID:        req.UserID,
		PartnershipID: req.PartnershipID,
		Type:          req.Type,
		Amount:        req.Amount,
		Description:   req.Description,
		Status:        "confirmed",
	}

	if err := h.walletService.CreateTransaction(&transaction); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, transaction)
}

func (h *WalletHandler) GetTransactions(c *gin.Context) {
	partnershipID, err := strconv.ParseUint(c.Param("partnershipId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid partnership ID"})
		return
	}

	transactions, err := h.walletService.GetTransactions(uint(partnershipID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, transactions)
}

func (h *WalletHandler) CreateGoal(c *gin.Context) {
	var req struct {
		PartnershipID uint    `json:"partnership_id" binding:"required"`
		Name          string  `json:"name" binding:"required"`
		Description   string  `json:"description"`
		TargetAmount  float64 `json:"target_amount" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	goal := models.Goal{
		PartnershipID: req.PartnershipID,
		Name:          req.Name,
		Description:   req.Description,
		TargetAmount:  req.TargetAmount,
		CurrentAmount: 0,
		Status:        "active",
	}

	if err := h.walletService.CreateGoal(&goal); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, goal)
}

func (h *WalletHandler) GetGoals(c *gin.Context) {
	partnershipID, err := strconv.ParseUint(c.Param("partnershipId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid partnership ID"})
		return
	}

	goals, err := h.walletService.GetGoals(uint(partnershipID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, goals)
}

func (h *WalletHandler) UpdateGoal(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid goal ID"})
		return
	}

	var updates map[string]interface{}
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.walletService.UpdateGoal(uint(id), updates); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Goal updated successfully"})
}