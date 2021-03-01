package client

import (
	"encoding/json"
	"html/template"
	"hummingbard/gomatrix"
	"log"
	"strings"
	"time"

	"github.com/tidwall/gjson"
)

type ProcessStateRequest struct {
	State []*gomatrix.Event
	User  *User
	Page  *TimelinePage
}

func (c *Client) ProcessState(req *ProcessStateRequest) {

	st, _ := json.Marshal(req.State)
	de := gjson.Parse(string(st)).Get(`#(type="com.hummingbard.room.info")`).Get("content.description")
	if de.String() != "" {
		html, err := UnsafeHTML(de.String())
		if err != nil {
			log.Println(err)
		} else {
			req.Page.Room.Description = html
		}
	}

	alias := gjson.Parse(string(st)).Get(`#(type="m.room.canonical_alias")`).Get("content.alias")
	if alias.String() != "" {
		req.Page.Room.Alias = alias.String()
	}

	owner := gjson.Parse(string(st)).Get(`#(type="m.room.create")`).Get("content.creator")
	if owner.String() != "" {

		ow := owner.String()

		if strings.Contains(ow, c.Config.Client.Domain) {
			s := strings.Split(ow, ":")
			ow = s[0]
		}

		req.Page.Room.Owner = User{
			UserID: ow,
		}
		if req.User != nil && req.User.UserID == owner.String() {
			req.Page.IsOwner = true
		}
	}

	name := gjson.Parse(string(st)).Get(`#(type="m.room.name")`).Get("content.name")
	if name.String() != "" {
		req.Page.Room.Name = name.String()
	}

	avatar := gjson.Parse(string(st)).Get(`#(type="m.room.avatar")`).Get("content.url")
	if avatar.String() != "" {
		avt := c.BuildImage(avatar.String())
		req.Page.Room.Avatar = avt
	}

	header := gjson.Parse(string(st)).Get(`#(type="com.hummingbard.room.header")`).Get("content.url")
	if header.String() != "" {
		avt := c.BuildImage(header.String())
		req.Page.Room.Header = avt
	}

	topic := gjson.Parse(string(st)).Get(`#(type="m.room.topic")`).Get("content.topic")
	if topic.String() != "" {
		html, err := ToStrictHTML(topic.String())
		if err != nil {
			log.Println(err)
			req.Page.Room.Topic = template.HTML(topic.String())
		} else {
			req.Page.Room.Topic = html
		}
	}

	roomType := gjson.Parse(string(st)).Get(`#(type="com.hummingbard.room")`).Get("content.room_type")
	if roomType.String() != "" {
		req.Page.Room.Type = roomType.String()
	} else {
		req.Page.Room.Archaic = true
	}

	cre := gjson.Parse(string(st)).Get(`#(type="m.room.create")`).Get("origin_server_ts")

	ct := cre.Int()
	y := time.Unix(ct/1000, ct/10000*1000)
	ft := y.Format("Jan 2, 2006")
	req.Page.Room.CreatedAt = ft

	powerlevels := gjson.Parse(string(st)).Get(`#(type="m.room.power_levels")`).Get("content.users")
	powerlevels.ForEach(func(key, value gjson.Result) bool {
		if req.User != nil && req.User.UserID != "" {

			if key.String() == req.User.UserID && value.Int() == 100 {
				req.Page.IsAdmin = true
			}
		}
		return true // keep iterating
	})

	style := gjson.Parse(string(st)).Get(`#(type="com.hummingbard.room.style")`).Get("content.css")
	if style.String() != "" {
		css := style.String()
		req.Page.Room.CSS = template.CSS(css)
	}

	members := gjson.Parse(string(st)).Get(`#(type="m.room.member")#`)
	mem := 0
	members.ForEach(func(key, value gjson.Result) bool {
		mem += 1
		return true // keep iterating
	})
	req.Page.Room.Members = mem - 2

	req.Page.Room.State = req.State
}

func (c *Client) IsPage(state []*gomatrix.Event) bool {

	st, _ := json.Marshal(state)
	roomType := gjson.Parse(string(st)).Get(`#(type="com.hummingbard.room")`).Get("content.room_type")
	if roomType.String() == "page" {
		return true
	}

	return false
}

func (c *Client) IsRoomArchaic(state []*gomatrix.Event) bool {

	st, _ := json.Marshal(state)
	roomType := gjson.Parse(string(st)).Get(`#(type="com.hummingbard.room")`).Get("content.room_type")
	if len(roomType.String()) > 0 {
		return false
	}

	return true
}

func (c *Client) CanonicalAliasFromState(state []*gomatrix.Event) string {

	st, _ := json.Marshal(state)

	alias := gjson.Parse(string(st)).Get(`#(type="m.room.canonical_alias")`).Get("content.alias")
	if alias.String() != "" {
		return alias.String()
	}
	return ""
}

func (c *Client) RoomCreateEventFromState(state []*gomatrix.Event) string {

	st, _ := json.Marshal(state)

	evid := gjson.Parse(string(st)).Get(`#(type="m.room.create")`).Get("event_id")
	if evid.String() != "" {
		return evid.String()
	}
	return ""
}
