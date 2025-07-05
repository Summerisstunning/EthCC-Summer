package handlers

import (
	"net/http"
	"strconv"

	"aa-sharing-backend/internal/models"
	"aa-sharing-backend/internal/services"

	"github.com/gin-gonic/gin"
)

type GratitudeHandler struct {
	gratitudeService *services.GratitudeService
}

func NewGratitudeHandler(gratitudeService *services.GratitudeService) *GratitudeHandler {
	return &GratitudeHandler{gratitudeService: gratitudeService}
}

func (h *GratitudeHandler) CreateGratitude(c *gin.Context) {
	var req struct {
		UserID        uint    `json:"user_id" binding:"required"`
		PartnershipID uint    `json:"partnership_id" binding:"required"`
		Content       string  `json:"content" binding:"required"`
		Amount        float64 `json:"amount"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	gratitude := models.GratitudeEntry{
		UserID:        req.UserID,
		PartnershipID: req.PartnershipID,
		Content:       req.Content,
		Amount:        req.Amount,
	}

	if err := h.gratitudeService.CreateGratitude(&gratitude); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gratitude)
}

func (h *GratitudeHandler) GetUserGratitude(c *gin.Context) {
	userID, err := strconv.ParseUint(c.Param("userId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	gratitudes, err := h.gratitudeService.GetUserGratitude(uint(userID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gratitudes)
}

func (h *GratitudeHandler) GetPartnershipGratitude(c *gin.Context) {
	partnershipID, err := strconv.ParseUint(c.Param("partnershipId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid partnership ID"})
		return
	}

	gratitudes, err := h.gratitudeService.GetPartnershipGratitude(uint(partnershipID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gratitudes)
}