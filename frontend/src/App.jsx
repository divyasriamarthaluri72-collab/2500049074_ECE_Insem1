import React, { useState } from "react";
import "./App.css";

function App() {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [token, setToken] = useState(
        sessionStorage.getItem("token") || ""
    );

    const [result, setResult] = useState("");

    const API = "http://localhost:5000/api";


    // USER REGISTRATION

    const register = async () => {

        try {

            const response = await fetch(`${API}/register`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name,
                    email,
                    password
                })

            });

            const data = await response.json();

            setResult(data.message);

        } catch (error) {

            setResult("Server Connection Failed");

        }

    };


    // USER LOGIN

    const login = async () => {

        try {

            const response = await fetch(`${API}/login`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email,
                    password
                })

            });

            const data = await response.json();

            if (response.ok) {

                setToken(data.token);

                sessionStorage.setItem("token", data.token);

            }

            setResult(data.message);

        } catch (error) {

            setResult("Login Failed");

        }

    };


    // PROTECTED ROUTES

    const accessResource = async (route) => {

        try {

            const response = await fetch(`${API}/${route}`, {

                headers: {
                    Authorization: `Bearer ${token}`
                }

            });

            const data = await response.json();

            setResult(JSON.stringify(data, null, 2));

        } catch (error) {

            setResult("Unable to access resource");

        }

    };


    // LOGOUT

    const logout = () => {

        setToken("");

        sessionStorage.removeItem("token");

        setResult("Logged Out Successfully");

    };


    return (

        <div className="container">

            <h1>Student Portal</h1>

            <h2>User Registration</h2>

            <input
                type="text"
                placeholder="Enter Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <input
                type="email"
                placeholder="Enter Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <input
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <button onClick={register}>
                Register
            </button>


            <h2>User Login</h2>

            <button onClick={login}>
                Login
            </button>


            <h2>Protected Resources</h2>

            <button onClick={() => accessResource("profile")}>
                My Profile
            </button>

            <button onClick={() => accessResource("courses")}>
                Courses
            </button>

            <button onClick={() => accessResource("records")}>
                Academic Records
            </button>

            <button onClick={() => accessResource("admin")}>
                Admin Access
            </button>

            <button onClick={logout}>
                Logout
            </button>


            <h3>Output</h3>

            <pre>{result}</pre>

        </div>

    );

}

export default App;