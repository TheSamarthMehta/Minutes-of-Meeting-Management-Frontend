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
    const [error, setError] = useState(null);
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



    const handleSignup = async (e) => {
        e.preventDefault();
        setError(null);
        
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
            
            // Store token and user info in localStorage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            setToken(response.data.token);
            setUser(response.data.user);
            
            navigate("/dashboard");
        } catch (err) {
            console.error('Signup error:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
            setErrorMessage(errorMsg);
            setShowErrorModal(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-teal-200/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-cyan-200/20 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>
            
            <div className="max-w-7xl w-full relative z-10">
                <div className="grid lg:grid-cols-5 gap-8 items-center">
                    {/* Welcome Card - Left Side */}
                    <div className="lg:col-span-2 hidden lg:block">
                        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/20 h-full flex flex-col justify-center">
                            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-4 py-2 rounded-full mb-6 w-fit shadow-lg">
                                <Sparkles className="w-5 h-5" />
                                <span className="text-sm font-semibold">Join Our Platform</span>
                            </div>
                            
                            <h2 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                                Start Your Journey
                                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">
                                    With MOM Manager
                                </span>
                            </h2>
                            
                            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                                Join thousands of teams managing their meetings effectively with our powerful platform.
                            </p>
                            
                            <div className="space-y-5">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                                        <Shield className="w-6 h-6 text-teal-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">Enterprise Security</h3>
                                        <p className="text-sm text-gray-600">Your data is protected with bank-level encryption</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                                        <Users className="w-6 h-6 text-cyan-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">Team Collaboration</h3>
                                        <p className="text-sm text-gray-600">Work together seamlessly across departments</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                        <Sparkles className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">Smart Automation</h3>
                                        <p className="text-sm text-gray-600">AI-powered features to save your time</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Signup Form Card - Right Side */}
                    <div className="lg:col-span-3">
                        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 lg:p-10 border border-white/20">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl mb-4 shadow-lg">
                                    <UserCircle className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                    Create Your Account
                                </h2>
                                <p className="text-gray-600">
                                    Get started with your free account today
                                </p>
                            </div>

                            <form onSubmit={handleSignup} className="space-y-4">
                                {/* Error Messages */}
                                {error && (
                                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl">
                                        <p className="text-sm font-medium">{error}</p>
                                    </div>
                                )}

                                {passwordError && (
                                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl">
                                        <p className="text-sm font-medium">{passwordError}</p>
                                    </div>
                                )}

                                {/* Name Fields */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <User className="h-5 w-5 text-teal-500" />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="John"
                                                value={firstName}
                                                onChange={(e) => handleFieldChange('firstName', e.target.value)}
                                                onBlur={() => handleBlur('firstName')}
                                                className={`w-full pl-12 pr-4 py-3 border ${touched.firstName && fieldErrors.firstName ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'} rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition duration-200 text-gray-900 placeholder-gray-400`}
                                                required
                                            />
                                        </div>
                                        {touched.firstName && fieldErrors.firstName && (
                                            <p className="mt-2 text-sm text-red-600">{fieldErrors.firstName}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <User className="h-5 w-5 text-teal-500" />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Doe"
                                                value={lastName}
                                                onChange={(e) => handleFieldChange('lastName', e.target.value)}
                                                onBlur={() => handleBlur('lastName')}
                                                className={`w-full pl-12 pr-4 py-3 border ${touched.lastName && fieldErrors.lastName ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'} rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition duration-200 text-gray-900 placeholder-gray-400`}
                                                required
                                            />
                                        </div>
                                        {touched.lastName && fieldErrors.lastName && (
                                            <p className="mt-2 text-sm text-red-600">{fieldErrors.lastName}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Email Field */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-teal-500" />
                                        </div>
                                        <input
                                            type="email"
                                            placeholder="john.doe@example.com"
                                            value={email}
                                            onChange={(e) => handleFieldChange('email', e.target.value)}
                                            onBlur={() => handleBlur('email')}
                                            className={`w-full pl-12 pr-4 py-3 border ${touched.email && fieldErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'} rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition duration-200 text-gray-900 placeholder-gray-400`}
                                            required
                                        />
                                    </div>
                                    {touched.email && fieldErrors.email && (
                                        <p className="mt-2 text-sm text-red-600">{fieldErrors.email}</p>
                                    )}
                                </div>

                                {/* Mobile Field */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Phone className="h-5 w-5 text-teal-500" />
                                        </div>
                                        <input
                                            type="tel"
                                            placeholder="1234567890"
                                            value={mobileNo}
                                            onChange={(e) => handleFieldChange('mobileNo', e.target.value)}
                                            onBlur={() => handleBlur('mobileNo')}
                                            className={`w-full pl-12 pr-4 py-3 border ${touched.mobileNo && fieldErrors.mobileNo ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'} rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition duration-200 text-gray-900 placeholder-gray-400`}
                                            required
                                        />
                                    </div>
                                    {touched.mobileNo && fieldErrors.mobileNo && (
                                        <p className="mt-2 text-sm text-red-600">{fieldErrors.mobileNo}</p>
                                    )}
                                </div>

                                {/* Password Fields */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Lock className="h-5 w-5 text-teal-500" />
                                            </div>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => handleFieldChange('password', e.target.value)}
                                                onBlur={() => handleBlur('password')}
                                                className={`w-full pl-12 pr-12 py-3 border ${touched.password && fieldErrors.password ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'} rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition duration-200 text-gray-900 placeholder-gray-400`}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition" />
                                                ) : (
                                                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition" />
                                                )}
                                            </button>
                                        </div>
                                        {touched.password && fieldErrors.password && (
                                            <p className="mt-2 text-sm text-red-600">{fieldErrors.password}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Lock className="h-5 w-5 text-teal-500" />
                                            </div>
                                            <input
                                                type="password"
                                                placeholder="••••••••"
                                                value={confirmPassword}
                                                onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                                                onBlur={() => handleBlur('confirmPassword')}
                                                className={`w-full pl-12 pr-4 py-3 border ${touched.confirmPassword && fieldErrors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'} rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition duration-200 text-gray-900 placeholder-gray-400`}
                                                required
                                            />
                                        </div>
                                        {touched.confirmPassword && fieldErrors.confirmPassword && (
                                            <p className="mt-2 text-sm text-red-600">{fieldErrors.confirmPassword}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Role Field */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Select Role</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Shield className="h-5 w-5 text-teal-500" />
                                        </div>
                                        <select
                                            value={role}
                                            onChange={(e) => handleFieldChange('role', e.target.value)}
                                            onBlur={() => handleBlur('role')}
                                            className={`w-full pl-12 pr-4 py-3 border ${touched.role && fieldErrors.role ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'} rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition duration-200 appearance-none text-gray-900 cursor-pointer`}
                                            required
                                        >
                                            <option value="Admin">Admin</option>
                                            <option value="Convener">Convener</option>
                                            <option value="Staff">Staff</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                    {touched.role && fieldErrors.role && (
                                        <p className="mt-2 text-sm text-red-600">{fieldErrors.role}</p>
                                    )}
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
                                            Creating Your Account...
                                        </div>
                                    ) : (
                                        'Create Account'
                                    )}
                                </button>

                                {/* Login Link */}
                                <div className="text-center pt-4">
                                    <p className="text-sm text-gray-600">
                                        Already have an account?{' '}
                                        <Link 
                                            to="/login" 
                                            className="font-semibold text-teal-600 hover:text-teal-700 transition"
                                        >
                                            Sign in instead
                                        </Link>
                                    </p>
                                </div>
                            </form>
                        </div>

                        {/* Footer Text */}
                        <p className="text-center text-sm text-gray-500 mt-6">
                            By creating an account, you agree to our Terms & Privacy Policy
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;