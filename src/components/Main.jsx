import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import ProjectList from './ProjectList';
import Header from './Header';
import '../css/Main.css';

const Main = () => {
    const [projects, setProjects] = useState([]);
    const projectNameRef = useRef();
    const projectContentRef = useRef();

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/projects`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProjects(response.data);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const handleAddProject = async () => {
        const name = projectNameRef.current.value;
        const content = projectContentRef.current.value;
        
        if (name === '') return;

        const newProject = {
            id: uuidv4(),
            name,
            content,
            preference: 0,
            completed: false
        };

        try {
            await axios.post(`${API_URL}/api/projects`, newProject, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setProjects([newProject, ...projects]);
            projectNameRef.current.value = '';
            projectContentRef.current.value = '';
        } catch (error) {
            console.error('Error adding project:', error);
            alert('案件の追加に失敗しました');
        }
    };

    const toggleProject = async (id) => {
        const project = projects.find(p => p.id === id);
        const updated = { ...project, completed: !project.completed };

        try {
            await axios.put(`${API_URL}/api/projects/${id}`, {
                preference: updated.preference,
                completed: updated.completed
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setProjects(projects.map(p => p.id === id ? updated : p));
        } catch (error) {
            console.error('Error updating project:', error);
        }
    };

    const updatePreference = async (id, preference) => {
        const project = projects.find(p => p.id === id);

        try {
            await axios.put(`${API_URL}/api/projects/${id}`, {
                preference,
                completed: project.completed
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setProjects(projects.map(p => p.id === id ? { ...p, preference } : p));
        } catch (error) {
            console.error('Error updating preference:', error);
        }
    };

    const deleteProject = async (id) => {
        try {
            await axios.delete(`${API_URL}/api/projects/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setProjects(projects.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error deleting project:', error);
        }
    };

    const handleClear = () => {
        const toDelete = projects.filter(p => p.completed);
        
        Promise.all(
            toDelete.map(p => 
                axios.delete(`${API_URL}/api/projects/${p.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            )
        ).then(() => {
            setProjects(projects.filter(p => !p.completed));
        }).catch(error => {
            console.error('Error clearing projects:', error);
        });
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        window.location.reload();
    };

    return (
        <div className="main-container">
            <div className="content-wrapper">
                <div className="user-info">
                    <span>ログイン中: {localStorage.getItem('username')}</span>
                    <button onClick={handleLogout} className="btn btn-secondary btn-small">
                        ログアウト
                    </button>
                </div>

                <Header />

                <div className="form-card">
                    <div className="form-group">
                        <label className="form-label">案件名</label>
                        <input 
                            type="text" 
                            ref={projectNameRef} 
                            className="form-input"
                            placeholder="例: 大手通信会社のWebシステム開発"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">案件内容</label>
                        <textarea
                            ref={projectContentRef}
                            className="form-textarea"
                            placeholder="案件の詳細を記載してください"
                        />
                    </div>
                    
                    <div className="button-group">
                        <button 
                            onClick={handleAddProject}
                            className="btn btn-primary"
                        >
                            ➕ プロジェクトを追加
                        </button>
                    </div>
                </div>

                <div className="projects-section">
                    <ProjectList 
                        projects={projects} 
                        toggleProject={toggleProject}
                        updatePreference={updatePreference}
                        deleteProject={deleteProject}
                    />
                </div>
            </div>
        </div>
    );
};

export default Main;
