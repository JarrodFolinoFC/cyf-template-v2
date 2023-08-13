import { useState, useEffect } from "react";
import jwtDecode from "jwt-decode";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const useAuth = () => {
	const navigate = useNavigate();
	const [user, setUser] = useState(null);
	const [clientId, setClientId] = useState("");
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [isProvider, setIsProvider] = useState(false);

	function getJwtToken() {
		return localStorage.getItem("jwtToken");
	}

	function handleSignUp() {
		/* global google */
		google.accounts.id.initialize({
			client_id: clientId,
			callback: handleCallbackResponse,
		});
		google.accounts.id.renderButton(document.getElementById("signInDiv"), {
			theme: "outline",
			size: "large",
		});
		google.accounts.id.prompt();
	}

	const handleSignOut = () => {
		localStorage.removeItem("jwtToken");
		setIsLoggedIn(false);
		navigate("/");
	};

	function handleCallbackResponse(response) {
		if (response && response.credential) {
			localStorage.setItem("jwtToken", response.credential);
			setIsLoggedIn(true);
			navigate("/dashboard");
		} else {
			console.error("Error handling callback response:", response);
		}
	}
	const handleDeleteProfile = async () => {
		try {
			const token = getJwtToken();
			const response = await fetch("/api/delete-profile", {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					token,
				}),
			});
			const data = await response.json();
			if (response.ok) {
				alert(data.message);
				handleSignOut();
			} else {
				console.log(data.error);
			}
		} catch (error) {
			console.error("An error occurred:", error);
		}
	};
	useEffect(() => {
		async function fetchClientId() {
			try {
				const response = await axios.get("/api/clientId");
				const { clientId } = response.data;
				setClientId(clientId);
			} catch (error) {
				console.error("Error fetching client ID:", error);
			}
		}
		fetchClientId();
	}, []);

	useEffect(() => {
		const token = localStorage.getItem("jwtToken");
		if (token !== null && token !== "") {
			const userObject = jwtDecode(token);
			const currentTime = Date.now() / 1000;

			if (userObject.exp > currentTime) {
				setUser(userObject);
				setIsLoggedIn(true);
			} else {
				setUser(null);
				localStorage.removeItem("jwtToken");
				setIsLoggedIn(false);
			}
		} else {
			setIsLoggedIn(false);
		}
	}, [navigate]);

	return {
		user,
		handleSignUp,
		handleSignOut,
		isLoggedIn,
		setIsLoggedIn,
		isProvider,
		setIsProvider,
		handleDeleteProfile,
		getJwtToken,
	};
};

export default useAuth;