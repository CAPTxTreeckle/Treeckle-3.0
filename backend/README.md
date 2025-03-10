## Requirements

Ensure you have the following installed on your local machine:

- [Python 3.9](https://www.python.org/downloads/)
- [Docker](https://docs.docker.com/desktop/)

## Setup

Navigate to the root of the `backend` directory, then execute:

For mac, **`python3 -m venv venv`**

For windows, **`py -m venv venv`**

To create a virtual environment.

Next, depending on the platform and shell used in your local machine, execute the corresponding command to activate the virtual environment.

| Platform | Shell           | Command to activate venv           |
| -------- | --------------- | ---------------------------------- |
| POSIX    | bash/zsh        | \$ source venv/bin/activate        |
|          | fish            | \$ . venv/bin/activate.fish        |
|          | csh/tcsh        | \$ source venv/bin/activate.csh    |
|          | PowerShell Core | \$ venv/bin/Activate.ps1           |
| Windows  | cmd.exe         | C:\\> venv\Scripts\activate.bat    |
|          | PowerShell      | PS C:\\> venv\Scripts\Activate.ps1 |

For e.g. on Mac, run **`source venv/bin/activate`**

Finally, execute:

**`pip install --upgrade pip`**

**`pip install -r requirements.txt`**

To install all app dependencies.

### Build and run the Docker containers

```
make docker-up
```

The backend should be running and accessible at `http://localhost:8000`

> Backend admin page is accessible at http://localhost:8000/administration  
> Username: dev  
> Password: dev

### Seeding the database

To load seed data into the database, run the following command:

```
make seed
```

This creates the following user accounts for the frontend:

- **Admin**

  - Email: admin@capt.com
  - Password: admin@capt.com

- **Resident**

  - Email: resident#@capt.com
  - Password: resident#

  where # is any integer between 1-5, i.e. resident1, resident2, resident3...

### Restart and Stop Docker containers

To restart the Docker containers, run:

```
make docker-restart
```

To stop the Docker containers, run:

```
make docker-down
```

### Formatting and Linting

To format the code, run:

```
make format
```

To lint the code, run:

```
make lint
```

### Run Development Server

```
make runserver
```

### Create migration

```
make makemigrations
```

### Run migration

```
make migrate
```

## Using External PostgreSQL Database

Update the `.env.backend.dev` file with the database credentials.

```
SQL_DATABASE=your_db_name
SQL_USER=your_db_user
SQL_PASSWORD=your_password
SQL_HOST=your_db_host
```
