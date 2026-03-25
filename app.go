package main

import (
	"Sector/internal/api"
	v1 "Sector/internal/api/v1"
	"context"
	"fmt"
	"log"
	"net"
	"net/http"

	"github.com/rs/cors"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/gorilla/mux"
)

// App struct
type App struct {
	ctx    context.Context
	server http.Server
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	// Startup the Database instance here
	// Startup the API interfaces here

	r := mux.NewRouter().StrictSlash(true)
	sectorAPI := v1.NewSector(context.WithoutCancel(openapi3.NewLoader().Context), "log.txt", "cache")
	api.AddV1SectorAPIToRouter(r, sectorAPI)

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:8000"},
		AllowCredentials: true,
	})

	// Serve HTTP
	a.server = http.Server{
		Handler: c.Handler(r),
		Addr:    net.JoinHostPort("127.0.0.1", "3000"),
	}

	// Start the http server
	go func() {
		log.Println("Starting server on :3000")
		if err := a.server.ListenAndServe(); err != nil {
			log.Fatal(err)
		}
	}()
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}
