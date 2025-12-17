import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const ResetPasswordPage = () => {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const { token: tokenFromParams } = useParams();
	const [searchParams] = useSearchParams();
	const token = tokenFromParams || searchParams.get('token');
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(null);

		if (!token) {
			setError("Reset token is missing. Please use the latest reset link from your email.");
			return;
		}

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		if (password.length < 8) {
			setError("Password must be at least 8 characters long");
			return;
		}

		setIsLoading(true);
		try {
			const response = await axios.post(`/auth/reset-password/${token}`, 
				{ password, confirmPassword },
				{ withCredentials: true }
			);

			if (response.data.success) {
				Swal.fire({
					icon: 'success',
					title: 'Password Reset',
					text: 'Your password has been reset successfully!',
					confirmButtonText: 'Go to Login'
				}).then(() => {
					navigate("/login");
				});
			}
		} catch (error) {
			setError(error.response?.data?.message || "Error resetting password");
			Swal.fire({
				icon: 'error',
				title: 'Error',
				text: error.response?.data?.message || 'Failed to reset password'
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex items-center justify-center min-h-screen ">
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className='max-w-md w-full bg-white bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden'
		>
			<div className='p-8'>
				<h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-teal-200 to-teal-300 text-transparent bg-clip-text'>
					Reset Password
				</h2>
				

				<form onSubmit={handleSubmit}>
					<div className='mb-6'>
						<div className='relative'>
							<input
								type={showPassword ? 'text' : 'password'}
								placeholder='New Password'
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								className='w-full px-4 py-3 rounded-lg bg-white/50 border-2 border-gray-300 text-gray-700 placeholder-gray-500 focus:outline-none focus:border-teal-500'
							/>
							<button
								type='button'
								onClick={() => setShowPassword(!showPassword)}
								className='absolute right-3 top-3 text-gray-500'
							>
								{showPassword ? '👁️' : '👁️‍🗨️'}
							</button>
						</div>
					</div>

					<div className='mb-6'>
						<div className='relative'>
							<input
								type={showConfirmPassword ? 'text' : 'password'}
								placeholder='Confirm New Password'
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								required
								className='w-full px-4 py-3 rounded-lg bg-white/50 border-2 border-gray-300 text-gray-700 placeholder-gray-500 focus:outline-none focus:border-teal-500'
							/>
							<button
								type='button'
								onClick={() => setShowConfirmPassword(!showConfirmPassword)}
								className='absolute right-3 top-3 text-gray-500'
							>
								{showConfirmPassword ? '👁️' : '👁️‍🗨️'}
							</button>
						</div>
					</div>
					{error && <p className='text-red-500 text-sm text-center mb-4'>{error}</p>}

					<motion.button
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						className='w-full py-3 px-4 bg-teal-500 text-white font-bold rounded-lg shadow-lg hover:bg-white hover:text-black  border-2 hover:border-teal-500  transition duration-200'
						type='submit'
						disabled={isLoading}
					>
						{isLoading ? "Resetting..." : "Set New Password"}
					</motion.button>
				</form>
			</div>
		</motion.div>
		</div>
	);
};
export default ResetPasswordPage;