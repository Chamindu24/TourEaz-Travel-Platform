import { motion } from "framer-motion";
import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

const ForgotPasswordPage = () => {
	const [email, setEmail] = useState("");
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		try {
			const response = await axios.post('/auth/forgot-password', { email }, {
				withCredentials: true
			});
			if (response.data.success) {
				setIsSubmitted(true);
			}
		} catch (error) {
			Swal.fire({
				icon: 'error',
				title: 'Error',
				text: error.response?.data?.message || 'Failed to send reset email'
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
			className='max-w-md w-full bg-white items-center bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden'
		>
			<div className='p-8'>
				<h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-teal-200 to-teal-300 text-transparent bg-clip-text'>
					Forgot Password
				</h2>

				{!isSubmitted ? (
					<form onSubmit={handleSubmit}>
						<p className='text-gray-700 mb-6 text-center'>
							Enter your email address and we'll send you a link to reset your password.
						</p>
						<div className='mb-6'>
							<input
								type='email'
								placeholder='Email Address'
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								className='w-full px-4 py-3 rounded-lg bg-white/50 border-2 border-gray-300 text-gray-700 placeholder-gray-500 focus:outline-none focus:border-teal-500'
							/>
						</div>
						<motion.button
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							className='w-full py-3 px-4 bg-teal-500 text-white  font-bold rounded-md shadow-lg hover:bg-white hover:text-black  border-2 hover:border-teal-500  transition duration-200'
							type='submit'
							disabled={isLoading}
						>
							{isLoading ? 'Sending...' : 'Send Reset Link'}
						</motion.button>
					</form>
				) : (
					<div className='text-center'>
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ type: "spring", stiffness: 500, damping: 30 }}
							className='w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4'
						>
							<svg className='h-8 w-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
							</svg>
						</motion.div>
						<p className='text-gray-800 mb-2'>
							If an account exists for {email}, you will receive a password reset link shortly.
						</p>
					</div>
				)}
			</div>

			<div className='px-8 py-4 bg-white bg-opacity-50 flex justify-center'>
				<Link to={"/login"} className='text-sm text-teal-200 hover:underline flex items-center'>
					← Back to Login
				</Link>
			</div>
		</motion.div>
        </div>
	);
};
export default ForgotPasswordPage;