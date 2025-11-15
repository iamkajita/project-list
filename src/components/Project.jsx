import React from 'react';
import '../css/Project.css';

const Project = ({ project, toggleProject, updatePreference, deleteProject }) => {


    const handlePreferenceChange = (e) => {
        updatePreference(project.id, parseInt(e.target.value));
    };

    const handleDelete = () => {
        if (window.confirm('この案件を削除しますか？')) {
            deleteProject(project.id);
        }
    };

    return (
        <div className="project-item">
            <div className="project-header">
                <h3 className={`project-name ${project.completed ? 'completed' : ''}`}>
                    {project.name}
                </h3>
                <button
                    onClick={handleDelete}
                    className="btn btn-danger btn-small"
                >
                    🗑️
                </button>
            </div>
            {project.content && (
                <div className="project-content">
                    <p>{project.content}</p>
                </div>
            )}

            <div className="preference-section">
                <span className="preference-label">希望度:</span>
                <div className="preference-options">
                    {[1, 2, 3, 4, 5].map((value) => (
                        <label key={value} className="preference-item">
                            <input
                                type="radio"
                                name={`preference-${project.id}`}
                                value={value}
                                checked={project.preference === value}
                                onChange={handlePreferenceChange}
                                className="preference-radio"
                            />
                            <span className="preference-number">{value}</span>
                        </label>
                    ))}
                </div>
                <span className="preference-result">
                    {project.preference === 0 ? '未評価' : `選択中: ${project.preference}`}
                </span>
            </div>
        </div>
    );
};

export default Project;