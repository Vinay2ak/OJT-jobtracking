# Job Tracker API Documentation

**Base URL:** `https://ojt-jobtracking-1906.onrender.com`

## 1. Authentication
This API uses **JWT (JSON Web Tokens)** for authentication.
*   After logging in, you will receive an `access` and a `refresh` token.
*   Include the `access` token in the header of all protected requests:
    `Authorization: Bearer <your_access_token>`

---

## 2. Authentication Endpoints

### Login (Username/Password)
*   **URL:** `/api/token/`
*   **Method:** `POST`
*   **Body:**
    ```json
    {
        "username": "your_username",
        "password": "your_password"
    }
    ```
*   **Response:** `{"refresh": "...", "access": "..."}`

### Signup
*   **URL:** `/api/accounts/signup/`
*   **Method:** `POST`
*   **Body:** `{"username": "...", "email": "...", "password": "..."}`

### Send OTP (For OTP Login)
*   **URL:** `/api/accounts/send-otp/`
*   **Method:** `POST`
*   **Body:** `{"email": "your_email@example.com"}`

---

## 3. Jobs Management (Protected)
*Header required: `Authorization: Bearer <token>`*

### List All Jobs
*   **URL:** `/api/jobs/`
*   **Method:** `GET`
*   **Filters:** `?status=applied`, `?platform=linkedin`, `?search=google`

### Add New Job
*   **URL:** `/api/jobs/`
*   **Method:** `POST`
*   **Body:**
    ```json
    {
        "company": "Company Name",
        "role": "Job Title",
        "platform": "linkedin/naukri/etc",
        "location": "City",
        "salary": "Range",
        "job_url": "URL",
        "notes": "Optional notes"
    }
    ```

### Update Job Status
*   **URL:** `/api/jobs/<id>/status/`
*   **Method:** `PATCH`
*   **Body:** `{"status": "interview"}`
*   **Valid Statuses:** `applied`, `viewed`, `interview`, `offer`, `rejected`, `withdrawn`

---

## 4. Dashboard Statistics (Protected)
*   **URL:** `/api/jobs/dashboard/`
*   **Method:** `GET`
*   **Response:** Returns total counts for each status and a list of recent applications.

---

## 5. Data Model (Job Object)
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | Integer | Unique ID |
| `company` | String | Name of the company |
| `role` | String | Job position/role |
| `status` | String | Current status of application |
| `platform` | String | Source (linkedin, naukri, etc) |
| `applied_date`| DateTime | Date added (Auto) |
