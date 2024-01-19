# LOG3990 - 103

## Installation

1. Install the dependencies with `npm ci` in `packages/client` and `packages/server`.
2. In `packages/client`m run command `cp .env.example .env`. Edit to have production database info if needed.

### Docker 🐋 (_Recommended_)

3. From the root directory, run `make dev`.
4. Visit [http://localhost:4200](http://localhost:4200).

#### Custom ports

If you have other projects running, make sure no ports are used. If needed, you can provide different ports to Docker.

| Variable            | Default |
| ------------------- | ------- |
| NGINX_PORT          | `80`    |
| SERVER_PORT         | `3000`  |
| CLIENT_PORT         | `4200`  |
| MONGO_EXPRESS_PORT  | `8081`  |
| PG_PORT             | `5432`  |

You can use them by adding them to the `.env` file in the root. For example, running `echo "CLIENT_PORT=8080" >> .env` will make the client start on the port `8080`. These changes are not watched by git, so it will only affect you. (_Note : the server port is hardcoded in the client code, changing it will most likely make the app crash_). -->

##### Changing postgres port

Changing postgres port is a little more tricky because we use scripts outside Docker for DB modifications. It might not be necessary, but it is better practice. After adding the `PG_PORT` in the `.env` file in the root, you will need to add the port to the server also. To do that, run `echo "PG_DEV_PORT=50432" >> .env` in `packages/server` (`50432` is an example, it can be whatever you want).

### Without Docker

3. Go to `packages/server`
    1. Run `cp .env.dev .env` (you only have to do this once)
4. Start the processes with `npm start` in `packages/client` and `packages/server`.
