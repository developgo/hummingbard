package client

import (
	"fmt"
	"hummingbard/gomatrix"
	"log"
)

func (c *Client) TempMatrixClient(userID, accessToken string) (*gomatrix.Client, error) {

	fu, us := c.IsFederated(userID)
	//port is only for my dev environment, this needs to go
	serverName := c.URLScheme(c.Config.Matrix.Server) + fmt.Sprintf(`:%d`, c.Config.Matrix.Port)

	//if federation user, we query homeserver at the /well-known endpoint
	//for full server path
	if fu {
		wk, err := WellKnown(c.URLScheme(us.ServerName))
		if err != nil {
			log.Println(err)
			return nil, err
		}
		serverName = c.URLScheme(wk.ServerName)
	}

	matrix, err := gomatrix.NewClient(serverName, "", "")

	if accessToken != "" {
		matrix.SetCredentials(userID, accessToken)
	}

	if err != nil {
		log.Println(err)
		return nil, err
	}

	return matrix, nil
}
