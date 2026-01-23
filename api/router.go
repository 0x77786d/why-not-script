package api

import (
	"github.com/gin-gonic/gin"

	"why-not-script/api/handlers"
)

func RegisterRoutes(router *gin.Engine, handler *handlers.Handler) {
	router.POST("/", handler.Root)
	router.POST("/exit", handler.Exit)

	login := router.Group("/login")
	login.POST("", handler.Login)
	login.POST("/check", handler.LoginCheck)
	login.POST("/logout", handler.Logout)

	course := router.Group("/course")
	course.POST("/search", handler.CourseSearch)

	queue := router.Group("/queue")
	queue.POST("", handler.QueueList)
	queue.POST("/add", handler.QueueAdd)
	queue.POST("/delete", handler.QueueDelete)
	queue.POST("/status", handler.QueueStatus)
	queue.POST("/log", handler.QueueLog)
}
