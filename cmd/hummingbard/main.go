package main

import (
	"hummingbard/client"
	"log"
	"os"
	"os/signal"
)

func main() {
	sc := make(chan os.Signal, 1)
	signal.Notify(sc, os.Interrupt)

	go func() {
		<-sc

		log.Println("Shutting down server")
		os.Exit(1)
	}()

	client.Start()
}
