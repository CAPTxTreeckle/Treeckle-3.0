## Using Docker

Ensure you have Docker installed on your local machine.

Navigate to the root of the project directory where the `docker-compose.yml` file is located.

Build and run the Docker containers:

```
docker-compose up --build
```

The backend should be running and accessible at `http://localhost:8000`

## Using External PostgreSQL Database

Update the `.env.backend.dev` file with the database credentials.

```
SQL_DATABASE=your_db_name
SQL_USER=your_db_user
SQL_PASSWORD=your_password
SQL_HOST=your_db_host
```

### Setup

Ensure you have [python 3.9](https://www.python.org/downloads/) installed on your local machine.

Then execute:

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

### Run Development Server

**`python treeckle/manage.py runserver`**

### Create migration

**`python treeckle/manage.py makemigrations`**

### Run migration

**`python treeckle/manage.py migrate`**
