package client

import (
	"errors"
	"net/http"
	"strings"

	"github.com/go-chi/chi"
)

func (c *Client) Dispatch() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		//This handler should do all sorts of path/routing stuff but for now we
		//hand off to timeline handler

		c.Timeline(w, r)
	}
}

type PathItemsSkeleton struct {
	Path   string   `json:"path"`
	Items  []string `json:"items"`
	Length int      `json:"length"`
}

func (c *Client) PathItems(r *http.Request) (*PathItemsSkeleton, error) {
	path := chi.URLParam(r, "*")
	pathItems := strings.Split(path, "/")

	if len(pathItems) == 0 {
		return nil, errors.New("Empty Path")
	}

	pi := &PathItemsSkeleton{
		Path:   path,
		Items:  pathItems,
		Length: len(pathItems),
	}

	if len(pathItems) > 1 {
		x := []string{}
		for _, item := range pathItems {
			if strings.Contains(item, "$") {
				x = append(x, item)
			} else {
				x = append(x, strings.ToLower(item))
			}
		}
		pi.Path = strings.Join(x, "/")
	}

	return pi, nil
}

func (c *PathItemsSkeleton) ItemByPosition(i int) (string, error) {

	if len(c.Items) == 0 {
		return "", errors.New("Empty Path.")
	}

	return c.Items[i], nil
}
