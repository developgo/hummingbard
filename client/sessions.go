package client

import (
	"encoding/json"
	"hummingbard/gomatrix"
	"log"
	"net/http"
	"strings"

	"github.com/gorilla/sessions"
	"github.com/tidwall/gjson"
)

type JoinedRoom struct {
	RoomID    string `json:"room_id"`
	RoomAlias string `json:"room_alias"`
}

type OwnedRoom struct {
	RoomID    string `json:"room_id"`
	RoomAlias string `json:"room_alias"`
}

type User struct {
	DisplayName       string       `json:"display_name"`
	AvatarURL         string       `json:"avatar_url"`
	AccessToken       string       `json:"access_token"`
	MatrixAccessToken string       `json:"matrix_access_token"`
	DeviceID          string       `json:"device_id"`
	HomeServer        string       `json:"home_server"`
	UserID            string       `json:"user_id"`
	RefreshToken      string       `json:"refresh_token"`
	RoomID            string       `json:"room_id"`
	JoinedRooms       []JoinedRoom `json:"joined_rooms"`
	OwnedRooms        []JoinedRoom `json:"owned_rooms"`
	WellKnown         string       `json:"well_known"`
	Federated         bool         `json:"federated"`
}

func NewSession(sec string) *sessions.CookieStore {
	s := sessions.NewCookieStore([]byte(sec))
	s.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   864000 * 150,
		HttpOnly: false,
	}
	return s
}

func GetSession(r *http.Request, c *Client) (*sessions.Session, error) {
	s, err := c.Sessions.Get(r, c.Config.Client.CookieName)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	return s, nil
}

func (c *Client) GetTokenUser(token string) (*User, error) {

	userid, err := c.Store.Get(token).Result()
	if err != nil {
		log.Println(err)
		return nil, err
	}

	user, err := c.Store.Get(userid).Result()
	if err != nil {
		log.Println(err)
		return nil, err
	}

	var us User
	err = json.Unmarshal([]byte(user), &us)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	return &us, nil

}

func (c *Client) AddJoinedRoom(j JoinedRoom, r *http.Request) error {

	s, err := c.Sessions.Get(r, c.Config.Client.CookieName)
	if err != nil {
		log.Println(err)
		return err
	}

	token, ok := s.Values["access_token"].(string)
	if ok {
		userid, err := c.Store.Get(token).Result()
		if err != nil {
			log.Println(err)
			return err
		}
		user, err := c.Store.Get(userid).Result()
		if err != nil {
			log.Println(err)
			return err
		}

		var us User
		err = json.Unmarshal([]byte(user), &us)
		if err != nil {
			log.Println(err)
			return err
		}

		us.JoinedRooms = append(us.JoinedRooms, j)

		serialized, err := json.Marshal(us)
		if err != nil {
			log.Println(err)
			return err
		}

		err = c.Store.Set(userid, serialized, 0).Err()
		if err != nil {
			log.Println(err)
			return err
		}

	}

	return nil
}

func (c *Client) UpdateJoinedRooms(matrix *gomatrix.Client, r *http.Request) error {
	rms, err := c.GetUserJoinedRooms(matrix)
	if err != nil {
		log.Println(err)
		return err
	}

	s, err := c.Sessions.Get(r, c.Config.Client.CookieName)
	if err != nil {
		log.Println(err)
		return err
	}

	token, ok := s.Values["access_token"].(string)
	if ok {
		userid, err := c.Store.Get(token).Result()
		if err != nil {
			log.Println(err)
			return err
		}
		user, err := c.Store.Get(userid).Result()
		if err != nil {
			log.Println(err)
			return err
		}

		var us User
		err = json.Unmarshal([]byte(user), &us)
		if err != nil {
			log.Println(err)
			return err
		}

		us.JoinedRooms = rms

		serialized, err := json.Marshal(us)
		if err != nil {
			log.Println(err)
			return err
		}

		err = c.Store.Set(userid, serialized, 0).Err()
		if err != nil {
			log.Println(err)
			return err
		}

	}

	return nil
}

func (c *Client) RefreshJoinedRooms(r *http.Request, rooms []string) error {
	s, err := c.Sessions.Get(r, c.Config.Client.CookieName)
	if err != nil {
		log.Println(err)
		return err
	}

	token, ok := s.Values["access_token"].(string)
	if ok {
		userid, err := c.Store.Get(token).Result()
		if err != nil {
			log.Println(err)
			return err
		}
		user, err := c.Store.Get(userid).Result()
		if err != nil {
			log.Println(err)
			return err
		}

		var us User
		err = json.Unmarshal([]byte(user), &us)
		if err != nil {
			log.Println(err)
			return err
		}

		rms := []JoinedRoom{}
		for i, _ := range rooms {
			x := JoinedRoom{
				RoomID: rooms[i],
			}
			room, ok := c.Cache.Rooms.Get(rooms[i])
			if ok {
				x.RoomAlias = room.(gomatrix.PublicRoom).CanonicalAlias
			}

			rms = append(rms, x)
		}

		us.JoinedRooms = rms

		serialized, err := json.Marshal(us)
		if err != nil {
			log.Println(err)
			return err
		}

		err = c.Store.Set(userid, serialized, 0).Err()
		if err != nil {
			log.Println(err)
			return err
		}

	}

	return nil
}

func (c *Client) UpdateUserRoomID(r *http.Request, roomID string) error {
	s, err := c.Sessions.Get(r, c.Config.Client.CookieName)
	if err != nil {
		log.Println(err)
		return err
	}

	token, ok := s.Values["access_token"].(string)
	if ok {
		userid, err := c.Store.Get(token).Result()
		if err != nil {
			log.Println(err)
			return err
		}
		user, err := c.Store.Get(userid).Result()
		if err != nil {
			log.Println(err)
			return err
		}

		var us User
		err = json.Unmarshal([]byte(user), &us)
		if err != nil {
			log.Println(err)
			return err
		}

		us.RoomID = roomID

		serialized, err := json.Marshal(us)
		if err != nil {
			log.Println(err)
			return err
		}

		err = c.Store.Set(userid, serialized, 0).Err()
		if err != nil {
			log.Println(err)
			return err
		}

	}

	return nil
}

func (c *Client) IsRoomMember(r *http.Request, roomID string) (bool, error) {
	s, err := c.Sessions.Get(r, c.Config.Client.CookieName)
	if err != nil {
		log.Println(err)
		return false, err
	}

	token, ok := s.Values["access_token"].(string)
	if ok {
		userid, err := c.Store.Get(token).Result()
		if err != nil {
			log.Println(err)
			return false, err
		}
		user, err := c.Store.Get(userid).Result()
		if err != nil {
			log.Println(err)
			return false, err
		}

		var us User
		err = json.Unmarshal([]byte(user), &us)
		if err != nil {
			log.Println(err)
			return false, err
		}

		for i, _ := range us.JoinedRooms {
			for x, _ := range us.JoinedRooms {
				if us.JoinedRooms[i] == us.JoinedRooms[x] {
					return true, nil
				}
			}
		}

	}

	return false, nil
}

func (c *Client) UpdateDisplayName(r *http.Request, displayName string) error {
	s, err := c.Sessions.Get(r, c.Config.Client.CookieName)
	if err != nil {
		log.Println(err)
		return err
	}

	token, ok := s.Values["access_token"].(string)
	if ok {
		userid, err := c.Store.Get(token).Result()
		if err != nil {
			log.Println(err)
			return err
		}
		user, err := c.Store.Get(userid).Result()
		if err != nil {
			log.Println(err)
			return err
		}

		var us User
		err = json.Unmarshal([]byte(user), &us)
		if err != nil {
			log.Println(err)
			return err
		}

		us.DisplayName = displayName

		serialized, err := json.Marshal(us)
		if err != nil {
			log.Println(err)
			return err
		}

		err = c.Store.Set(userid, serialized, 0).Err()
		if err != nil {
			log.Println(err)
			return err
		}

	}

	return nil
}

func (c *Client) UpdateAvatar(r *http.Request, avatar string) error {
	s, err := c.Sessions.Get(r, c.Config.Client.CookieName)
	if err != nil {
		log.Println(err)
		return err
	}

	token, ok := s.Values["access_token"].(string)
	if ok {
		userid, err := c.Store.Get(token).Result()
		if err != nil {
			log.Println(err)
			return err
		}
		user, err := c.Store.Get(userid).Result()
		if err != nil {
			log.Println(err)
			return err
		}

		var us User
		err = json.Unmarshal([]byte(user), &us)
		if err != nil {
			log.Println(err)
			return err
		}

		us.AvatarURL = avatar

		serialized, err := json.Marshal(us)
		if err != nil {
			log.Println(err)
			return err
		}

		err = c.Store.Set(userid, serialized, 0).Err()
		if err != nil {
			log.Println(err)
			return err
		}

	}

	return nil
}

func (c *Client) GetUserJoinedRooms(matrix *gomatrix.Client) ([]JoinedRoom, error) {

	fil, err := matrix.CreateFilter([]byte(`
{
	"room": {
		"timeline": {
			"limit": 0,
			"types": ["com.hummingbard.post"]
		}
	}
}
	`))

	sre, err := matrix.SyncRequest(0, "", fil.FilterID, true, "offline")

	if err != nil {
		log.Println(err)
		return nil, err
	}

	rms := []JoinedRoom{}
	for roomID, room := range sre.Rooms.Join {

		st, _ := json.Marshal(room.State.Events)
		roomType := gjson.Parse(string(st)).Get(`#(type="com.hummingbard.room")`).Get("content.room_type")

		if roomType.String() == "page" || roomType.String() == "post" {
			continue
		}
		alias := gjson.Parse(string(st)).Get(`#(type="m.room.canonical_alias")`).Get("content.alias")
		if len(alias.String()) > 0 &&
			!strings.Contains(alias.String(), "#@") &&
			!strings.Contains(alias.String(), "#thread") &&
			!strings.Contains(alias.String(), "#public") {
			rms = append(rms, JoinedRoom{RoomID: roomID, RoomAlias: alias.String()})
		}
	}
	return rms, nil
}
