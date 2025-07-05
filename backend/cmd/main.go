package main

import (
	"log"
	"os"

	"aa-sharing-backend/internal/config"
	"aa-sharing-backend/internal/handlers"
	"aa-sharing-backend/internal/models"
	"aa-sharing-backend/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Initialize database
	db, err := initDB()
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto-migrate models
	if err := db.AutoMigrate(
		&models.User{},
		&models.Partnership{},
		&models.GratitudeEntry{},
		&models.Goal{},
		&models.Transaction{},
		&models.WalletBalance{},
	); err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	// Initialize services
	userService := services.NewUserService(db)
	gratitudeService := services.NewGratitudeService(db)
	walletService := services.NewWalletService(db)

	// Initialize handlers
	userHandler := handlers.NewUserHandler(userService)
	gratitudeHandler := handlers.NewGratitudeHandler(gratitudeService)
	walletHandler := handlers.NewWalletHandler(walletService)

	// Setup router
	r := gin.Default()

	// Setup CORS
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	})
	r.Use(gin.WrapH(c.Handler(r)))

	// Routes
	api := r.Group("/api/v1")
	{
		// User routes
		api.POST("/users", userHandler.CreateUser)
		api.GET("/users/:id", userHandler.GetUser)
		api.PUT("/users/:id", userHandler.UpdateUser)

		// Authentication routes
		api.POST("/auth/login", userHandler.Login)
		api.POST("/auth/register", userHandler.Register)

		// Gratitude routes
		api.POST("/gratitude", gratitudeHandler.CreateGratitude)
		api.GET("/gratitude/user/:userId", gratitudeHandler.GetUserGratitude)

		// Wallet routes
		api.GET("/wallet/:partnershipId", walletHandler.GetWalletBalance)
		api.POST("/wallet/contribute", walletHandler.Contribute)
		api.GET("/wallet/transactions/:partnershipId", walletHandler.GetTransactions)

		// Goal routes
		api.POST("/goals", walletHandler.CreateGoal)
		api.GET("/goals/:partnershipId", walletHandler.GetGoals)
		api.PUT("/goals/:id", walletHandler.UpdateGoal)
	}

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	log.Fatal(r.Run(":" + port))
}

func initDB() (*gorm.DB, error) {
	cfg := config.LoadConfig()
	return gorm.Open(postgres.Open(cfg.DatabaseURL), &gorm.Config{})
}