import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Shield, Sparkles, AlertTriangle, X } from 'lucide-react';
import { useAuth } from './AuthContext';
import { api } from '../../shared/utils/api';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Admin');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const { setUser, setToken } = useAuth();
    const navigate = useNavigate();
    
    const validateForm = () => {
        const errors = [];
        
        if (!email.trim()) {
            errors.push('Please fill the email field');
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            errors.push('Please enter a valid email address');
        }
        
        if (!password.trim()) {
            errors.push('Please fill the password field');
        } else if (password.length < 6) {
            errors.push('Password must be at least 6 characters');
        }
        
        if (!role) {
            errors.push('Please select a role');
        }
        
        return errors;
    };
    
    const handleLogin = async (e) => {
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
            const response = await api.post('/auth/login', { email, password, role });
            
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            setToken(response.data.token);
            setUser(response.data.user);
            
            navigate("/dashboard");
        } catch (err) {
            console.error('Login error:', err);
            setErrorMessage(err.message || 'Login failed. Please check your credentials.');
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

            <div className="w-full max-w-6xl mx-auto relative z-10 px-2 sm:px-4">
                <div className="grid gap-8 lg:gap-12 md:grid-cols-2 items-center">
                    {/* Left Side - Branding (visible on all screens, adapts layout) */}
                    <div className="space-y-6 text-center md:text-left order-2 md:order-1">
                        <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-teal-100 dark:border-teal-900 mx-auto md:mx-0 w-max">
                                <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Meeting Management System</span>
                            </div>
                            
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                                Welcome Back to
                                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400">
                                    MOM Manager
                                </span>
                            </h1>
                            
                        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl mx-auto md:mx-0">
                                Streamline your meetings, track minutes, and collaborate effectively with your team.
                            </p>

                        <div className="space-y-4 pt-2 sm:pt-4">
                            <div className="flex items-start gap-3 text-left bg-white/80 dark:bg-gray-800/50 px-4 py-3 rounded-2xl shadow-sm border border-white/40 dark:border-gray-700">
                                <div className="flex-shrink-0 w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Secure & Reliable</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Enterprise-grade security for your data</p>
                                    </div>
                                </div>
                                
                            <div className="flex items-start gap-3 text-left bg-white/80 dark:bg-gray-800/50 px-4 py-3 rounded-2xl shadow-sm border border-white/40 dark:border-gray-700">
                                <div className="flex-shrink-0 w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Smart Features</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">AI-powered insights and automation</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Login Form */}
                    <div className="w-full max-w-md mx-auto md:ml-auto order-1 md:order-2">
                        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-6 sm:p-8 md:p-10">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl mb-4 shadow-lg">
                                    <Shield className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                    Sign In
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Access your account to continue
                                </p>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-5">
                                {/* Error Message */}
                                {error && (
                                    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-400 text-red-700 dark:text-red-400 p-4 rounded-lg">
                                        <p className="text-sm font-medium">{error}</p>
                                    </div>
                                )}

                                {/* Email Field */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-teal-500 dark:text-teal-400" />
                                        </div>
                                        <input
                                            type="email"
                                            placeholder="Enter your email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                        />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Password
                                        </label>
                                        <button type="button" className="text-sm font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition">
                                            Forgot password?
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-teal-500 dark:text-teal-400" />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter your password"
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

                                {/* Login Button */}
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
                                            Signing in...
                                        </div>
                                    ) : (
                                        'Sign In'
                                    )}
                                </button>

                                {/* Sign Up Link */}
                                <div className="text-center pt-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Don't have an account?{' '}
                                        <Link 
                                            to="/signup" 
                                            className="font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition"
                                        >
                                            Create account
                                        </Link>
                                    </p>
                                </div>
                            </form>
                        </div>

                        {/* Footer Text */}
                        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                            Protected by enterprise-grade security
                        </p>
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
}

export default LoginPage;
