import React, { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const { username, password } = formData;

    const onChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const onSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/register', formData);
            localStorage.setItem('token', res.data.token);
            navigate('/');
        } catch (err) {
            console.error(err.response?.data);
            setError(err.response?.data?.msg || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            <div className="card" style={{
                maxWidth: '450px',
                width: '100%',
                padding: '2.5rem'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>

                    <h2 style={{
                        fontSize: '2rem',
                        marginBottom: '0.5rem',
                        background: 'var(--gradient-primary)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        Create Account
                    </h2>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Join StockMaster to manage your inventory
                    </p>
                </div>

                {error && (
                    <div style={{
                        padding: '1rem',
                        marginBottom: '1rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid var(--danger)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--danger)',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={onSubmit} style={{ padding: 0, background: 'transparent', border: 'none' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            color: 'var(--text-secondary)',
                            fontSize: '0.9rem',
                            fontWeight: '500'
                        }}>
                            Username
                        </label>
                        <input
                            type="text"
                            placeholder="Choose a username"
                            name="username"
                            value={username}
                            onChange={onChange}
                            required
                            minLength="3"
                            style={{ margin: 0 }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            color: 'var(--text-secondary)',
                            fontSize: '0.9rem',
                            fontWeight: '500'
                        }}>
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="Create a strong password"
                            name="password"
                            value={password}
                            onChange={onChange}
                            required
                            minLength="6"
                            style={{ margin: 0 }}
                        />
                        <p style={{
                            fontSize: '0.8rem',
                            color: 'var(--text-muted)',
                            marginTop: '0.5rem',
                            marginBottom: 0
                        }}>
                            Must be at least 6 characters
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            fontSize: '1rem',
                            marginBottom: '1rem'
                        }}
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>

                    <div style={{
                        textAlign: 'center',
                        padding: '1rem',
                        background: 'rgba(51, 65, 85, 0.3)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-secondary)'
                    }}>
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            style={{
                                color: 'var(--primary-light)',
                                textDecoration: 'none',
                                fontWeight: '600'
                            }}
                        >
                            Login here
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
