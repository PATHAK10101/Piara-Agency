import React from 'react';
import dubaiCityscape from '../assets/images/dubai1.jpg';

const About = () => {
  return (
    <section id="about" className="about-section">
      <div className="container">
        <div className="about-content">
          <div className="about-text">
            <h2 className="section-title">About PIARA AGENCY</h2>
            <div className="mission-vision">
              <div className="mission">
                <h3>Our Mission</h3>
                <p>
                  To empower startups and growing companies with innovative advertising, media, and marketing solutions by combining data-driven strategies with cinematic storytelling and hyper-targeted campaigns.
                </p>
              </div>
              <div className="vision">
                <h3>Our Vision</h3>
                <p>
                  To become the leading catalyst for transformative business success in Dubai and beyond, setting new standards for creative excellence and strategic impact in the digital marketing landscape.
                </p>
              </div>
            </div>
            <div className="founders">
              <h3>Meet Our Founders</h3>
              <div className="founders-grid">
                <div className="founder">
                  <h4>Arnav Gupta</h4>
                  <span>Founder & Creative Director</span>
                  <p>
                    With a passion for visual storytelling and strategic marketing, Arnav brings years of experience in creating compelling brand narratives that resonate with diverse audiences.
                  </p>
                </div>
                <div className="founder">
                  <h4>Pinar Tukta</h4>
                  <span>Co-Founder & Strategy Director</span>
                  <p>
                    Pinar combines analytical thinking with creative vision to develop data-driven marketing strategies that deliver measurable results.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="about-image">
            <img src={dubaiCityscape} alt="Dubai Cityscape" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;

