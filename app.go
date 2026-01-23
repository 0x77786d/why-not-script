package main

import (
	"context"
	"embed"
	"fmt"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"log"
	"why-not-script/api"
	"why-not-script/api/handlers"
	"why-not-script/config"
	"why-not-script/state"
	"why-not-script/store"
	"why-not-script/worker"
)

//go:embed all:frontend/dist
var assets embed.FS

type App struct {
	ctx context.Context
}

func NewApp() *App {
	return &App{}
}

func (a *App) LoadConfig() map[string]interface{} {
	cfg := config.GetConfig()
	return map[string]interface{}{
		"clientAddress": cfg.ClientAddress,
	}
}

func (a *App) startup(ctx context.Context) {
	go func() {
		logStore := store.NewLogStore()
		queueStore, err := store.NewQueueStore()
		if err != nil {
			log.Fatalf("queue store init failed: %v", err)
		}
		defer func() {
			_ = queueStore.Close()
		}()

		_ = queueStore.UserQuit(logStore)

		sessions := state.NewSessionState()
		handler := handlers.NewHandler(sessions, queueStore, logStore)

		router := gin.New()
		router.Use(gin.Logger(), gin.Recovery())
		router.Use(cors.New(cors.Config{
			AllowOrigins:     []string{"*"},
			AllowMethods:     []string{"*"},
			AllowHeaders:     []string{"*"},
			ExposeHeaders:    []string{"Content-Disposition"},
			AllowCredentials: true,
		}))

		api.RegisterRoutes(router, handler)

		ctx, cancel := context.WithCancel(context.Background())
		defer cancel()
		go worker.StartKeepaliveWorker(ctx, sessions)
		go worker.StartQueueWorker(ctx, sessions, queueStore)

		if err := router.Run("0.0.0.0:2023"); err != nil {
			log.Fatalf("server failed: %v", err)
		}
	}()
}

func main() {
	app := NewApp()

	err := wails.Run(&options.App{
		Title:  "why-not-script",
		Width:  1200,
		Height: 800,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 255, G: 255, B: 255, A: 1},
		OnStartup:        app.startup,
		Bind: []interface{}{
			app,
		},
	})

	if err != nil {
		fmt.Println("Error:", err.Error())
	}
}
