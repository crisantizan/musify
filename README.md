# Cisum API

Cisum is a small on-line music player developed in NodeJS (ExpressJS) and MongoDB (Mongoose), using Typescript as super set.

| Prefix main route | Authorization header | Authorization header type |
| ----------------- | -------------------- | ------------------------- |
| /api              | yes                  | Bearer token              |

## User roles

| USER                        | ADMIN                               |
| --------------------------- | ----------------------------------- |
| normal user, only read data | administrator user, manage all data |

## Global response schema

For every request executed this is the schema data that will be received:

```typescript
{
    /** HTTP method **/
    method: string;
    /** current date **/
    timestamp: Date;
    /** current path **/
    path: string;
    /** HTTP status code **/
    status: number;
    /** returned data **/
    response: any // here comes data that current endpoint has return
}
```

## Endpoints

### Users

| Description                      | Main path |
| -------------------------------- | --------- |
| manage data of users, both roles | /users    |

#### Available endpoints

##### Create user

| Description                             | Path | Full path  | Method | Auth token | User role |
| --------------------------------------- | ---- | ---------- | ------ | ---------- | --------- |
| create a new user (only of "USER" type) | /    | /api/users | POST   | yes        | ADMIN     |

###### Body

```typescript
{
	name: string;
  	surname: string;
  	password: string;
  	email: string;
  	role: 'ADMIN' | 'USER';
  	image?: string;
}
```

###### Response

```typescript
{
	_id: string;
	name: string;
  	surname: string;
  	password: string;
  	email: string;
  	role: 'ADMIN' | 'USER';
  	image: string | null;
}
```

HTTP status code: 201

##### Login

| Description | Path   | Full path        | Method | Auth token | User role |
| ----------- | ------ | ---------------- | ------ | ---------- | --------- |
| user login  | /login | /api/users/login | POST   | no         | no        |

###### Body

```typescript
{
    email: string;
    password: string;
}
```

###### Response

```typescript
{
    user: {
        _id: string;
        name: string;
    	surname: string;
    	password: string;
    	email: string;
    	role: 'ADMIN' | 'USER';
    	image: string | null;
    },
    token: string
}
```

HTTP status code: 200

##### Logout

| Description | Path    | Full path         | Method | Auth token | User role |
| ----------- | ------- | ----------------- | ------ | ---------- | --------- |
| user logout | /logout | /api/users/logout | POST   | yes        | both      |

###### Response

```typescript
"logout sucessfully"
```

HTTP status code: 200

### Artists

### Albums

### Songs



<p align="center"> Cristian Santiz, 2020</p>

