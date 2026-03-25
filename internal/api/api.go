package api

import (
	v1 "Sector/internal/api/v1"
	"Sector/internal/middleware"
	"embed"
	"encoding/json"
	"net/http"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/getkin/kin-openapi/openapi3filter"
	"github.com/gorilla/mux"
	oapimiddleware "github.com/oapi-codegen/nethttp-middleware"
)

//go:embed v1/swagger-ui.html
var swaggerUI embed.FS

// A helper function to take any SectorAPI instance and add it to the given mux router instance.
func AddV1SectorAPIToRouter(router *mux.Router, api *v1.SectorAPI) {
	// Setup the swagger docs.
	swaggerV1, err := v1.GetSwagger()
	if err != nil {
		panic(err)
	}
	// Clear out the servers array in the swagger spec, that skips validating
	// that server names match. We don't know how this thing will be run.
	swaggerV1.Servers = nil
	fixSwaggerPrefix("/v1/api", swaggerV1)

	// Add middleware
	router.Use(middleware.RequestLogger(api.Logger))

	// Serve the swagger.json file directly at /docs/swagger.json
	router.HandleFunc("/v1/swagger.json", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(swaggerV1)
	})

	// Serve the Swagger UI using a CDN
	router.HandleFunc("/v1/swagger-ui/", func(w http.ResponseWriter, r *http.Request) {
		data, err := swaggerUI.ReadFile("v1/swagger-ui.html")
		if err != nil {
			http.Error(w, "swagger-ui.html not found", http.StatusNotFound)
			return
		}
		w.Header().Set("Content-Type", "text/html")
		w.Write([]byte(data))
	})

	// Create public API subrouter (no JWT authentication)
	publicRouter := router.PathPrefix("/v1/api").Subrouter()
	// Register /challenge
	publicRouter.HandleFunc("/challenge", func(w http.ResponseWriter, r *http.Request) {
		params := v1.GetChallengeParams{
			Username: r.URL.Query().Get("username"),
		}
		api.GetChallenge(w, r, params)
	}).Methods("GET")

	// Register /login
	publicRouter.HandleFunc("/login", api.Login).Methods("POST")

	// Apply OpenAPI validation
	publicRouter.Use(oapimiddleware.OapiRequestValidator(swaggerV1))

	v1.HandlerWithOptions(api, v1.GorillaServerOptions{
		BaseURL:    "/v1/api",
		BaseRouter: router,
		Middlewares: []v1.MiddlewareFunc{
			oapimiddleware.OapiRequestValidatorWithOptions(
				swaggerV1,
				&oapimiddleware.Options{
					Options: openapi3filter.Options{
						AuthenticationFunc: middleware.NewAuthenticator(),
					},
				},
			),
		},
	})
}

// Necessary so that we can use the OapiRequestValidator with a BaseURL
func fixSwaggerPrefix(prefix string, swagger *openapi3.T) {
	var updatedPaths openapi3.Paths = openapi3.Paths{}

	for key, value := range swagger.Paths.Map() {
		updatedPaths.Set(prefix+key, value)
	}

	swagger.Paths = &updatedPaths
}
