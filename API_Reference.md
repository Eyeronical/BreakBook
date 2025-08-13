# API Interaction Examples – Employees & Leaves

This document demonstrates example API usage for common operations on the **Full‑stack Leave Management System** including employee creation, balance management, leave application, approval, and rejection.  
Each example includes the `curl` command, request body (if any), and example responses.

---

## 1. Get All Employees
```
curl http://localhost:3000/api/v1/employees
```
**Response**:
```
[
  {
    "id": "emp_1",
    "name": "John Doe",
    "email": "john@example.com",
    "department": "Engineering",
    "joiningDate": "2024-01-10",
    "initialLeaveDays": 7,
    "status": "ACTIVE",
    "createdAt": "2024-01-10T10:00:00.000Z",
    "updatedAt": "2024-01-10T10:00:00.000Z"
  }
]
```

---

## 2. Create New Employee
```
curl -X POST http://localhost:3000/api/v1/employees \
-H "Content-Type: application/json" \
-d '{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "department": "Design",
  "joiningDate": "2024-02-01"
}'
```
**Response** *(success)*:
```
{
  "id": "emp_2",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "department": "Design",
  "joiningDate": "2024-02-01",
  "initialLeaveDays": 7,
  "status": "ACTIVE",
  "createdAt": "2024-02-01T09:00:00.000Z",
  "updatedAt": "2024-02-01T09:00:00.000Z"
}
```

**Response** *(duplicate email)*:
```
{ "message": "Email already exists" }
```

---

## 3. Get Employee's Leave Balance
```
curl http://localhost:3000/api/v1/employees/emp_1/leave-balance
```
**Response**:
```
{
  "accrued": 7,
  "approvedDays": 3,
  "pendingDays": 0,
  "available": 4
}
```

---

## 4. Update Employee's Leave Balance
```
curl -X PATCH http://localhost:3000/api/v1/employees/emp_1/leave-balance \
-H "Content-Type: application/json" \
-d '{ "balance": 10 }'
```
**Updated Response (after setting balance)**:
```
{
  "accrued": 10,
  "approvedDays": 3,
  "pendingDays": 0,
  "available": 7
}
```

---

## 5. Get All Leaves (with employee details)
```
curl http://localhost:3000/api/v1/leaves
```
**Response**:
```
[
  {
    "id": "lv_1",
    "employeeId": "emp_1",
    "startDate": "2024-01-15",
    "endDate": "2024-01-17",
    "daysRequested": 3,
    "status": "APPROVED",
    "reason": "Personal",
    "createdAt": "2024-01-12T12:00:00.000Z",
    "decidedAt": "2024-01-13T08:30:00.000Z",
    "employee": {
      "id": "emp_1",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
]
```

---

## 6. Apply for Leave
```
curl -X POST http://localhost:3000/api/v1/leaves \
-H "Content-Type: application/json" \
-d '{
  "employeeId": "emp_1",
  "startDate": "2024-02-05",
  "endDate": "2024-02-07",
  "reason": "Family event"
}'
```
**Response** *(success)*:
```
{
  "id": "lv_2",
  "employeeId": "emp_1",
  "startDate": "2024-02-05",
  "endDate": "2024-02-07",
  "daysRequested": 3,
  "status": "PENDING",
  "reason": "Family event",
  "createdAt": "2024-02-01T09:15:00.000Z"
}
```

**Response** *(overlapping leave error)*:
```
{ "message": "Requested range overlaps with existing leave" }
```

---

## 7. Approve Leave Request
```
curl -X POST http://localhost:3000/api/v1/leaves/lv_2/approve \
-H "Content-Type: application/json" \
-d '{
  "approverId": "hr_1",
  "remarks": "Approved"
}'
```
**Response**:
```
{
  "id": "lv_2",
  "status": "APPROVED",
  "approverId": "hr_1",
  "approverRemarks": "Approved",
  "decidedAt": "2024-02-02T10:00:00.000Z"
}
```

---

## 8. Reject Leave Request
```
curl -X POST http://localhost:3000/api/v1/leaves/lv_3/reject \
-H "Content-Type: application/json" \
-d '{
  "approverId": "hr_1",
  "remarks": "Insufficient balance"
}'
```
**Response**:
```
{
  "id": "lv_3",
  "status": "REJECTED",
  "approverId": "hr_1",
  "approverRemarks": "Insufficient balance",
  "decidedAt": "2024-02-02T11:00:00.000Z"
}
```

---
