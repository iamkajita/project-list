import React from "react";
import '../css/Header.css';

const Header = () => {
    return (
        <div className="header-card">
            <h1 className="header-title">案件提案システム</h1>
            <p className="header-subtitle">案件を管理して、希望度を評価しましょう</p>
        </div>
    );
};

export default Header;