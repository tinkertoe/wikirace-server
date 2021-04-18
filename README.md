# wikirace-server

## Environment variables

| Name                 | Description                                             | Default                          |
| -------------------- | ------------------------------------------------------- | -------------------------------- |
| `PORT`               | Server port                                             | 34611                            |
| `MONITOR_PW`         | Password for monitor panel. User is always `admin`.     | Won't get setup without password |
| `MATCHMAKE_REQUESTS` | Number of requests to the matchmaker API per 10 minutes | 1000                             |
| `MONITOR_REQUESTS`   | Number of requests to the monitor panel per 10 minutes  | 500                              |