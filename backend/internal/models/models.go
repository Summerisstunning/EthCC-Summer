package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Email     string         `json:"email" gorm:"unique;not null"`
	Name      string         `json:"name"`
	WalletAddress string     `json:"wallet_address"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

type Partnership struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	UserAID   uint           `json:"user_a_id"`
	UserBID   uint           `json:"user_b_id"`
	UserA     User           `json:"user_a" gorm:"foreignKey:UserAID"`
	UserB     User           `json:"user_b" gorm:"foreignKey:UserBID"`
	Status    string         `json:"status" gorm:"default:'active'"` // active, inactive, split
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

type GratitudeEntry struct {
	ID           uint           `json:"id" gorm:"primaryKey"`
	UserID       uint           `json:"user_id"`
	User         User           `json:"user" gorm:"foreignKey:UserID"`
	PartnershipID uint          `json:"partnership_id"`
	Partnership  Partnership   `json:"partnership" gorm:"foreignKey:PartnershipID"`
	Content      string         `json:"content"`
	Amount       float64        `json:"amount"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`
}

type Goal struct {
	ID            uint           `json:"id" gorm:"primaryKey"`
	PartnershipID uint           `json:"partnership_id"`
	Partnership   Partnership    `json:"partnership" gorm:"foreignKey:PartnershipID"`
	Name          string         `json:"name"`
	Description   string         `json:"description"`
	TargetAmount  float64        `json:"target_amount"`
	CurrentAmount float64        `json:"current_amount"`
	Status        string         `json:"status" gorm:"default:'active'"` // active, completed, cancelled
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `json:"-" gorm:"index"`
}

type Transaction struct {
	ID            uint           `json:"id" gorm:"primaryKey"`
	UserID        uint           `json:"user_id"`
	User          User           `json:"user" gorm:"foreignKey:UserID"`
	PartnershipID uint           `json:"partnership_id"`
	Partnership   Partnership    `json:"partnership" gorm:"foreignKey:PartnershipID"`
	Type          string         `json:"type"` // gratitude, contribution, split
	Amount        float64        `json:"amount"`
	Description   string         `json:"description"`
	TxHash        string         `json:"tx_hash"`
	Status        string         `json:"status" gorm:"default:'pending'"` // pending, confirmed, failed
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `json:"-" gorm:"index"`
}

type WalletBalance struct {
	ID            uint           `json:"id" gorm:"primaryKey"`
	PartnershipID uint           `json:"partnership_id"`
	Partnership   Partnership    `json:"partnership" gorm:"foreignKey:PartnershipID"`
	Balance       float64        `json:"balance"`
	LastUpdated   time.Time      `json:"last_updated"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `json:"-" gorm:"index"`
}