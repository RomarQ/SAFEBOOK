import React from 'react';
import AuthMenu from '../components/AuthMenu';
import Footer from '../components/Footer';

export const MainLayout = ({content}) => (
    <div className="main-layout">
        <AuthMenu />
        <main style={{marginTop: '20px'}}>
            { content }
        </main>
        <Footer />
    </div>
)
