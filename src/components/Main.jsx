import React from "react";
import { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ProjectList from './ProjectList';
import '../css/Main.css';

const Main = () => {
    const [projects, setProjects] = useState([
        { id: 1, name: 'Project A', completed: false, content: 'Content for Project A', preference: 0 }
    ]);

    const projectNameRef = useRef();
    const projectContentRef = useRef();

    const handleAddProject = () => {
        const name = projectNameRef.current.value;
        const content = projectContentRef.current.value;
        
        if (name === '') return;
        
        setProjects((prevProjects) => {
            return [...prevProjects, { 
                id: uuidv4(), 
                name: name, 
                content: content,
                completed: false,
                preference: 0
            }];
        });
        
        projectNameRef.current.value = null;
        projectContentRef.current.value = null;
    }

    const toggleProject = (id) => {
        const newProjects = [...projects];
        const project = newProjects.find((project) => project.id === id);
        project.completed = !project.completed;
        setProjects(newProjects);
    };

    const updatePreference = (id, preference) => {
        const newProjects = projects.map((project) => 
            project.id === id ? { ...project, preference } : project
        );
        setProjects(newProjects);
    };

    // 追加: 個別のプロジェクトを削除する関数
    const deleteProject = (id) => {
        const newProjects = projects.filter((project) => project.id !== id);
        setProjects(newProjects);
    };

    const handleClear = () => {
        const newProjects = projects.filter((project) => !project.completed);
        setProjects(newProjects);
    };

    return (
        <div className="main-container">
            <div className="content-wrapper">
                <div className="header-card">
                    <h1>案件提案システム</h1>
                    <p>案件を管理して、希望度を評価しましょう</p>
                </div>

                <div className="form-card">
                    <div className="form-group">
                        <label className="form-label">案件名</label>
                        <input 
                            type="text" 
                            ref={projectNameRef} 
                            className="form-input"
                            placeholder="例: Webシステム開発"
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
                            ➕ 追加
                        </button>
                    </div>
                </div>

                <div className="projects-section">
                    <ProjectList 
                        projects={projects} 
                        toggleProject={toggleProject}
                        updatePreference={updatePreference}
                        deleteProject={deleteProject}  // 追加
                    />
                </div>
            </div>
        </div>
    );
};

export default Main;