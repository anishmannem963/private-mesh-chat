package middleware

import (
	"Sector/internal/auth"
	"context"
	"errors"

	"github.com/getkin/kin-openapi/openapi3filter"
)

type contextKey string

const (
	ContextKeyUser contextKey = "user"
)

// NewAuthenticator returns the AuthenticationFunc used by oapi-codegen to do authentication checking of JWT tokens using the auth module we made.
func NewAuthenticator() func(ctx context.Context, input *openapi3filter.AuthenticationInput) error {
	return func(ctx context.Context, input *openapi3filter.AuthenticationInput) error {
		// Extract the request
		req := input.RequestValidationInput.Request

		// Extract token
		tokenStr, err := auth.ExtractTokenFromRequest(req)
		if err != nil {
			return errors.New("unauthorized: token missing or malformed")
		}

		// Validate token
		claims, err := auth.ValidateToken(tokenStr)
		if err != nil {
			return errors.New("unauthorized: invalid token")
		}

		// Add claims to context
		ctx = context.WithValue(ctx, ContextKeyUser, claims)
		*input.RequestValidationInput.Request = *req.WithContext(ctx)

		return nil
	}
}
