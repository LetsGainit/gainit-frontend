import './About.css';

function About(){
    return (
        <div className="about-page">
            {/* Hero Section */}
            <section className="about-hero">
                <div className="about-hero-content">
                    <h1 className="about-hero-title">About GainIt</h1>
                    <p className="about-hero-subtitle">
                        Empowering the next generation of tech professionals through meaningful collaboration and mentorship
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="about-section">
                <div className="about-container">
                    <div className="about-content">
                        <h2 className="about-section-title">Our Mission</h2>
                        <p className="about-section-text">
                            GainIt bridges the gap between aspiring tech professionals and experienced mentors, 
                            creating opportunities for growth, learning, and meaningful impact. We believe that 
                            everyone deserves access to quality mentorship and real-world project experience.
                        </p>
                    </div>
                </div>
            </section>

            {/* Vision Section */}
            <section className="about-section about-section-alt">
                <div className="about-container">
                    <div className="about-content">
                        <h2 className="about-section-title">Our Vision</h2>
                        <p className="about-section-text">
                            To create a world where every aspiring tech professional has access to mentorship, 
                            real-world experience, and the opportunity to make a positive impact through technology. 
                            We envision a community where knowledge flows freely and everyone can grow together.
                        </p>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="about-section">
                <div className="about-container">
                    <h2 className="about-section-title text-center">How It Works</h2>
                    <div className="about-steps">
                        <div className="about-step">
                            <div className="about-step-number">1</div>
                            <h3 className="about-step-title">Choose Your Role</h3>
                            <p className="about-step-text">
                                Whether you're a Gainer looking to learn, a Mentor ready to share knowledge, 
                                or a Non-profit seeking tech solutions, we have a place for you.
                            </p>
                        </div>
                        <div className="about-step">
                            <div className="about-step-number">2</div>
                            <h3 className="about-step-title">Connect & Collaborate</h3>
                            <p className="about-step-text">
                                Join projects that match your interests and skills. Work with mentors and 
                                peers to build real solutions while developing your expertise.
                            </p>
                        </div>
                        <div className="about-step">
                            <div className="about-step-number">3</div>
                            <h3 className="about-step-title">Grow & Impact</h3>
                            <p className="about-step-text">
                                Develop new skills, build your portfolio, and make a meaningful impact 
                                on projects that matter to communities and organizations.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="about-section about-section-alt">
                <div className="about-container">
                    <h2 className="about-section-title text-center">Our Values</h2>
                    <div className="about-values">
                        <div className="about-value">
                            <div className="about-value-icon">🤝</div>
                            <h3 className="about-value-title">Collaboration</h3>
                            <p className="about-value-text">
                                We believe in the power of working together to achieve greater outcomes 
                                than any individual could accomplish alone.
                            </p>
                        </div>
                        <div className="about-value">
                            <div className="about-value-icon">📚</div>
                            <h3 className="about-value-title">Learning</h3>
                            <p className="about-value-text">
                                Continuous learning is at the heart of everything we do. We create 
                                environments where curiosity and growth are encouraged.
                            </p>
                        </div>
                        <div className="about-value">
                            <div className="about-value-icon">💡</div>
                            <h3 className="about-value-title">Innovation</h3>
                            <p className="about-value-text">
                                We embrace new ideas and approaches, always looking for better ways 
                                to solve problems and create value.
                            </p>
                        </div>
                        <div className="about-value">
                            <div className="about-value-icon">🌍</div>
                            <h3 className="about-value-title">Impact</h3>
                            <p className="about-value-text">
                                Our work is driven by the desire to make a positive difference in 
                                communities and organizations through technology.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Community Section */}
            <section className="about-section">
                <div className="about-container">
                    <div className="about-content">
                        <h2 className="about-section-title">Join Our Community</h2>
                        <p className="about-section-text">
                            GainIt is more than just a platform—it's a community of passionate individuals 
                            committed to growth, learning, and making a difference. Whether you're just 
                            starting your tech journey or have years of experience to share, there's a 
                            place for you here.
                        </p>
                        <div className="about-cta">
                            <a href="/choose-role" className="about-cta-button">
                                Get Started Today
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default About;