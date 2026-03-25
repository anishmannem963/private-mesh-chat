package middleware

import (
	"log/slog"
	"net/http"
	"strings"

	"github.com/felixge/httpsnoop"
	"github.com/gorilla/mux"
	"go.uber.org/zap"
)

func RequestLogger(logger *zap.Logger) mux.MiddlewareFunc {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Gathers metrics from the upstream handlers
			metrics := httpsnoop.CaptureMetrics(next, w, r)

			logger.Info(
				strings.Join([]string{
					"Handled Request: ",
					slog.String("method", r.Method).Value.String(),
					slog.String("uri", r.URL.RequestURI()).Value.String(),
					slog.String("user_agent", r.Header.Get("User-Agent")).Value.String(),
					slog.String("ip", r.RemoteAddr).Value.String(),
					slog.Int("code", metrics.Code).Value.String(),
					slog.Int64("bytes", metrics.Written).Value.String(),
					slog.Duration("request_time", metrics.Duration).Value.String(),
				}, ""),
			)
		})
	}
}
