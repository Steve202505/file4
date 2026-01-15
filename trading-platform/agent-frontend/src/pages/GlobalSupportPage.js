import React, { useState, useEffect, useCallback } from 'react';
import { Card, Form, Button, Spinner, Container } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { adminService } from '../services/adminService';
import { useNavigate } from 'react-router-dom';

const GlobalSupportPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const fetchGlobalSettings = useCallback(async () => {
        setFetching(true);
        try {
            const response = await adminService.getGlobalSettings();
            if (response.success) {
                setMessage(response.settings?.globalSupportMessage || '');
            }
        } catch (error) {
            console.error('Error fetching global settings:', error);
            toast.error(t('error_fetch_global_settings', 'Failed to load global settings'));
        } finally {
            setFetching(false);
        }
    }, [t]);

    useEffect(() => {
        fetchGlobalSettings();
    }, [fetchGlobalSettings]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await adminService.updateGlobalSettings({
                globalSupportMessage: message
            });

            if (response.success) {
                toast.success(t('global_support_saved', 'Global support message saved successfully!'));
            }
        } catch (error) {
            console.error('Error updating global settings:', error);
            toast.error(error.message || t('global_support_failed', 'Failed to save global message'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-4" style={{ minHeight: '100vh' }}>
            <style>
                {`
                @keyframes slideInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes pulseGlow {
                    0% { box-shadow: 0 0 5px rgba(64, 158, 255, 0.2); }
                    50% { box-shadow: 0 0 20px rgba(64, 158, 255, 0.4); }
                    100% { box-shadow: 0 0 5px rgba(64, 158, 255, 0.2); }
                }

                .animate-slide-up {
                    animation: slideInUp 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                }

                .glass-card {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 20px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    overflow: hidden;
                    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
                }

                .console-textarea {
                    background: rgba(255, 255, 255, 0.02) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    color: #fff !important;
                    border-radius: 16px !important;
                    padding: 25px !important;
                    font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
                    font-size: 16px !important;
                    line-height: 1.7 !important;
                    box-shadow: inset 0 2px 10px rgba(0,0,0,0.3) !important;
                    transition: all 0.3s ease !important;
                }

                .console-textarea:focus {
                    border-color: var(--primary-blue) !important;
                    background: rgba(255, 255, 255, 0.04) !important;
                    box-shadow: inset 0 2px 10px rgba(0,0,0,0.4), 0 0 20px rgba(64, 158, 255, 0.1) !important;
                }

                .glow-icon-box {
                    background: linear-gradient(135deg, rgba(64, 158, 255, 0.2) 0%, rgba(64, 158, 255, 0.05) 100%);
                    border: 1px solid rgba(64, 158, 255, 0.3);
                    border-radius: 20px;
                    padding: 24px;
                    display: inline-block;
                    margin-bottom: 25px;
                    animation: pulseGlow 3s infinite;
                }

                .section-title {
                    font-weight: 700;
                    letter-spacing: -1px;
                    background: linear-gradient(135deg, #fff 0%, #909399 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .btn-premium {
                    background: linear-gradient(135deg, var(--primary-blue) 0%, #5d9fff 100%);
                    border: none;
                    border-radius: 12px;
                    padding: 12px 40px;
                    font-weight: 600;
                    color: white;
                    box-shadow: 0 8px 20px rgba(64, 158, 255, 0.3);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .btn-premium:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 25px rgba(64, 158, 255, 0.4);
                    filter: brightness(1.1);
                }

                .btn-premium:disabled {
                    opacity: 0.6;
                    transform: none;
                }

                .status-indicator {
                    width: 8px;
                    height: 8px;
                    background: #10b981;
                    border-radius: 50%;
                    display: inline-block;
                    margin-right: 8px;
                    box-shadow: 0 0 10px #10b981;
                }

                .back-btn-glass {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 50%;
                    width: 42px;
                    height: 42px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #909399;
                    transition: all 0.2s ease;
                }

                .back-btn-glass:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                    transform: scale(1.05);
                }
                `}
            </style>

            <div className="d-flex align-items-center justify-content-between mb-5 animate-slide-up">
                <div className="d-flex align-items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="back-btn-glass"
                    >
                        <i className="bi bi-chevron-left"></i>
                    </button>
                    <div>
                        <h3 className="section-title mb-1 fw-bold">{t('global_support', 'Global Support')}</h3>
                        <p className="text-secondary small mb-0 d-flex align-items-center">
                            <span className="status-indicator"></span>
                            {t('system_online', 'Broadcast System Online')}
                        </p>
                    </div>
                </div>
            </div>

            <Card className="glass-card animate-slide-up border-0" style={{ animationDelay: '0.1s' }}>
                <div
                    className="p-5 text-center"
                    style={{
                        background: 'radial-gradient(circle at top, rgba(64, 158, 255, 0.1) 0%, transparent 70%)',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                >
                    <div className="glow-icon-box">
                        <i className="bi bi-broadcast" style={{ fontSize: '2.5rem', color: 'var(--primary-blue)' }}></i>
                    </div>
                    <h2 className="text-white fw-bold mb-3" style={{ fontSize: '2.2rem', letterSpacing: '-1px' }}>
                        {t('global_support_console', 'Broadcast Console')}
                    </h2>
                    <p className="text-secondary mx-auto mb-0 lh-lg" style={{ maxWidth: '650px', fontSize: '1.05rem' }}>
                        {t('global_message_description', 'Deploy a platform-wide message that will be visible to all users. This message serves as the default support communication.')}
                    </p>
                </div>

                <Card.Body className="p-5">
                    {fetching ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" style={{ color: 'var(--primary-blue)' }} />
                            <p className="text-muted mt-4 letter-spacing-1">{t('loading', 'INITIALIZING CONSOLE...')}</p>
                        </div>
                    ) : (
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-5">
                                <div className="d-flex align-items-center justify-content-between mb-4">
                                    <Form.Label className="text-white fw-bold mb-0 d-flex align-items-center gap-2" style={{ fontSize: '1.1rem' }}>
                                        <i className="bi bi-card-text" style={{ color: 'var(--primary-blue)' }}></i>
                                        {t('broadcast_message', 'Message Content')}
                                    </Form.Label>
                                    <div className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-20 px-3 py-2 rounded-pill">
                                        <i className="bi bi-circle-fill me-2 fs-xs" style={{ fontSize: '8px' }}></i>
                                        {t('active_transmission', 'System Ready')}
                                    </div>
                                </div>
                                <Form.Control
                                    as="textarea"
                                    placeholder={t('type_global_message_here', 'Enter announcement, support links, or critical updates...')}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="console-textarea shadow-none"
                                    style={{ minHeight: '300px' }}
                                />
                                <div className="d-flex align-items-center gap-2 mt-4 text-secondary small p-3 glass-card border-white border-opacity-5 rounded-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
                                    <i className="bi bi-info-circle" style={{ color: 'var(--primary-blue)' }}></i>
                                    {t('broadcast_help', 'Links included in the message will be automatically hyperlinked for the end-user.')}
                                </div>
                            </Form.Group>

                            <div className="d-flex justify-content-end align-items-center gap-4 pt-4 border-top border-white border-opacity-5">
                                <Button
                                    variant="link"
                                    className="text-secondary fw-bold text-decoration-none hover-text-white transition-all p-0"
                                    onClick={() => navigate(-1)}
                                >
                                    {t('cancel', 'Discard')}
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-premium d-flex align-items-center"
                                >
                                    {loading ? (
                                        <>
                                            <Spinner animation="border" size="sm" className="me-2" />
                                            {t('transmitting', 'PROCESSING...')}
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-send-fill me-2"></i>
                                            {t('broadcast_to_all', 'Send Broadcast')}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default GlobalSupportPage;
