import React from 'react'
import Project from './Project';
import '../css/ProjectList.css';

const ProjectList = ({projects, toggleProject, updatePreference, deleteProject}) => {
  if (projects.length === 0) {
    return (
      <div className="empty-state">
        <p>案件がまだ登録されていません</p>
      </div>
    );
  }

  return (
    <div className="project-list-container">
      {projects.map((project) => (
        <Project 
          project={project} 
          key={project.id} 
          toggleProject={toggleProject}
          updatePreference={updatePreference}
          deleteProject={deleteProject} 
        />
      ))}
    </div>
  );
};

export default ProjectList;