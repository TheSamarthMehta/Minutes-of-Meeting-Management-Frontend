import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Mail, Phone, Lock, UserCircle, CheckCircle, Shield, Sparkles, Users, AlertTriangle, X } from 'lucide-react';
import { useAuth } from './AuthContext';
import { api } from '../../shared/utils/api';

const SignupPage = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [mobileNo, setMobileNo] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("Staff");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const { setUser, setToken } = useAuth();
    const navigate = useNavigate();

    const validateForm = () => {
        const errors = [];
        
        if (!firstName.trim()) {
            errors.push('Please fill the first name field');
        }
        
        if (!lastName.trim()) {
            errors.push('Please fill the last name field');
        }
        
        if (!email.trim()) {
            errors.push('Please fill the email field');
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            errors.push('Please enter a valid email address');
        }
        
        if (!mobileNo.trim()) {
            errors.push('Please fill the mobile number field');
        } else if (mobileNo.length !== 10) {
            errors.push('Mobile number must be 10 digits');
        }
        
        if (!password.trim()) {
            errors.push('Please fill the password field');
        } else if (password.length < 6) {
            errors.push('Password must be at least 6 characters');
        }
        
        if (!confirmPassword.trim()) {
            errors.push('Please fill the confirm password field');
        } else if (confirmPassword !== password) {
            errors.push('Passwords do not match');
        }
        
        if (!role) {
            errors.push('Please select a role');
        }
        
        return errors;
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const validationErrors = validateForm();
        
        if (validationErrors.length > 0) {
            setErrorMessage(validationErrors.join('\n'));
            setShowErrorModal(true);
            return;
        }
        
        setLoading(true);

        try {
            const userData = {
                firstName,
                lastName,
                email,
                mobileNo,
                password,
                role: role
            };

            const response = await api.post('/auth/register', userData);
            
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            setToken(response.data.token);
            setUser(response.data.user);
            
            navigate("/dashboard");
        } catch (err: any) {
            console.error('Signup error:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
            setErrorMessage(errorMsg);
            setShowErrorModal(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-teal-200/20 dark:from-teal-600/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-cyan-200/20 dark:from-cyan-600/10 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>
            
            <div className="max-w-7xl w-full relative z-10">
                <div className="grid lg:grid-cols-5 gap-8 items-center">
                    {/* Welcome Card - Left Side */}
                    <div className="lg:col-span-2 hidden lg:block">
                        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/20 dark:border-gray-700/50 h-full flex flex-col justify-center">
                            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-4 py-2 rounded-full mb-6 w-fit shadow-lg">
                                <Sparkles className="w-5 h-5" />
                                <span className="text-sm font-semibold">Join Our Platform</span>
                            </div>
                            
                            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                                Start Your Journey
                                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400">
                                    With MOM Manager
                                </span>
                            </h2>
                            
                            <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg leading-relaxed">
                                Join thousands of teams managing their meetings effectively with our powerful platform.
                            </p>
                            
                            <div className="space-y-5">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center">
                                        <Shield className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Enterprise Security</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Your data is protected with bank-level encryption</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center">
                                        <Users className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Team Collaboration</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Work seamlessly with your entire organization</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Easy Setup</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Get started in minutes, no credit card required</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Card - Right Side */}
                    <div className="lg:col-span-3">
                        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 border border-white/20 dark:border-gray-700/50">
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Your Account</h1>
                                <p className="text-gray-600 dark:text-gray-400">Fill in your details to get started</p>
                            </div>

                            <form onSubmit={handleSignup} className="space-y-5">
                                {/* Name Fields */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">First Name</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <User className="h-5 w-5 text-teal-500 dark:text-teal-400" />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="John"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <User className="h-5 w-5 text-teal-500 dark:text-teal-400" />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Doe"
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Email Field */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-teal-500 dark:text-teal-400" />
                                        </div>
                                        <input
                                            type="email"
                                            placeholder="john.doe@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                        />
                                    </div>
                                </div>

                                {/* Mobile Field */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Mobile Number</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Phone className="h-5 w-5 text-teal-500 dark:text-teal-400" />
                                        </div>
                                        <input
                                            type="tel"
                                            placeholder="1234567890"
                                            value={mobileNo}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (/^\d*$/.test(value) && value.length <= 10) {
                                                    setMobileNo(value);
                                                }
                                            }}
                                            className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                        />
                                    </div>
                                </div>

                                {/* Password Fields */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Password</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Lock className="h-5 w-5 text-teal-500 dark:text-teal-400" />
                                            </div>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full pl-12 pr-12 py-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition" />
                                                ) : (
                                                    <Eye className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Lock className="h-5 w-5 text-teal-500 dark:text-teal-400" />
                                            </div>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Role Selection */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Role</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <UserCircle className="h-5 w-5 text-teal-500 dark:text-teal-400" />
                                        </div>
                                        <select
                                            value={role}
                                            onChange={(e) => setRole(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition duration-200 text-gray-900 dark:text-white appearance-none cursor-pointer"
                                        >
                                            <option value="Staff">Staff</option>
                                            <option value="Manager">Manager</option>
                                            <option value="Admin">Admin</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold py-3.5 px-6 rounded-xl hover:from-teal-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transform transition duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/30"
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Creating account...
                                        </div>
                                    ) : (
                                        'Create Account'
                                    )}
                                </button>

                                {/* Login Link */}
                                <div className="text-center pt-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Already have an account?{' '}
                                        <Link 
                                            to="/login" 
                                            className="font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition"
                                        >
                                            Sign in
                                        </Link>
                                    </p>
                                </div>

                                {/* Terms */}
                                <p className="text-xs text-center text-gray-500 dark:text-gray-400 pt-4">
                                    By signing up, you agree to our{' '}
                                    <a href="#" className="text-teal-600 dark:text-teal-400 hover:underline">Terms of Service</a>
                                    {' '}and{' '}
                                    <a href="#" className="text-teal-600 dark:text-teal-400 hover:underline">Privacy Policy</a>
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Modal Popup */}
            {showErrorModal && (
                <div className="fixed inset-0 bg-black/30 dark:bg-black/60 flex items-center justify-center z-50 p-4 animate-fadeIn" onClick={() => setShowErrorModal(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-sm w-full animate-slideUp border border-gray-200 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
                        <div className="p-5">
                            <div className="space-y-3">
                                {errorMessage.split('\n').map((error, index) => (
                                    <p key={index} className="text-sm text-gray-700 dark:text-gray-300">
                                        {error}
                                    </p>
                                ))}
                            </div>
                            
                            <button
                                onClick={() => setShowErrorModal(false)}
                                className="mt-4 w-full bg-gray-800 dark:bg-gray-700 text-white text-sm py-2.5 px-4 rounded-lg hover:bg-gray-900 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { 
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                .animate-slideUp {
                    animation: slideUp 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default SignupPage;
