import React, { useState } from 'react';
import Layout from '../components/Layout';

// ✅ Image Imports for Each Step
import validateTicker from '../AssetLogs/validateTicker.png';
import checkAffordability from '../AssetLogs/checkAffordability.png';
import selectedContract from '../AssetLogs/selectedContract.png';
import analyzeTradeController from '../AssetLogs/analyzeTradeController.png';
import sentimentData from '../AssetLogs/sentimentData.png';
import congressionalActivity from '../AssetLogs/congressionalActivity.png';
import congressionalDetails from '../AssetLogs/congressionalDetails.png';
import enrichingTicker from '../AssetLogs/enrichingTicker.png';
import ObjectEnrichment from '../AssetLogs/ObjectEnrichment.png';
import perValidated from '../AssetLogs/perValidated.png';
import FullEnrichment from '../AssetLogs/FullEnrichment.png';
import promptSetup1 from '../AssetLogs/promptSetup1.png';
import promptSetup2 from '../AssetLogs/promptSetup2.png';
import promptSetup3 from '../AssetLogs/promptSetup3.png';
import promptSetup4 from '../AssetLogs/promptSetup4.png';
import promptSetup5 from '../AssetLogs/promptSetup5.png';
import gptResponse from '../AssetLogs/gptResponse.png';
import finalGptResponse from '../AssetLogs/finalGptResponse.png';
import CronJob from '../AssetLogs/CronJob.png';
import vercelDeploy from '../AssetLogs/Vercel_Frontend_Deploy.png';
import renderDeploy from '../AssetLogs/render.com_deploy.png';

const MarketPage: React.FC = () => {

  return (
    <Layout>
      <main className="container py-5">
        {/* 🧭 Intro Section */}
        <section className="mb-5 text-center">
          <h2 className="fs-2 fw-bold mb-3">Explore the Trade Recommendation Pipeline</h2>
          <p className="text-secondary">
            We walk through how our AI analyzes your selected stock and generates actionable recommendations.
          </p>
        </section>

        {/* 🌐 Deployment Overview */}
        <section className="mb-5">
          <h3 className="fs-4 fw-bold">⚙️ DevOps & Deployment</h3>
          <p>Our frontend is deployed using <strong>Vercel</strong> and our backend is hosted on <strong>Render.com</strong>. This enables seamless CI/CD workflows for stakeholders and students—develop locally, commit to GitHub, and auto-deploy to production.</p>
          <div className="row g-3">
            <div className="col-md-6">
              <img src={vercelDeploy} className="img-fluid rounded shadow" alt="Vercel Frontend Deployment" />
              <p className="small text-center mt-2">Frontend Deployment via Vercel</p>
            </div>
            <div className="col-md-6">
              <img src={renderDeploy} className="img-fluid rounded shadow" alt="Render Backend Deployment" />
              <p className="small text-center mt-2">Backend Deployment via Render</p>
            </div>
          </div>
        </section>

        {/* 🔍 Step 1 — Ticker & Capital Validation */}
        <section className="mb-5">
          <h3 className="fs-4 fw-bold">1️⃣ Validate Ticker & Capital</h3>
          <p>We check that the ticker exists and ensure the user has enough capital to afford a close in-the-money option contract.</p>
          <div className="row g-3">
            <div className="col-md-4"><img src={validateTicker} className="img-fluid rounded shadow" alt="Validate Ticker" /></div>
            <div className="col-md-4"><img src={checkAffordability} className="img-fluid rounded shadow" alt="Check Affordability" /></div>
            <div className="col-md-4"><img src={selectedContract} className="img-fluid rounded shadow" alt="Selected Contract" /></div>
          </div>
        </section>

        {/* 🤖 Step 2 — Analyze Trade */}
        <section className="mb-5">
          <h3 className="fs-4 fw-bold">2️⃣ Analyze Trade</h3>
          <p>We analyze news sentiment via Polygon.io and dynamically scrape CapitolTrades using Puppeteer.js for political activity.</p>
          <div className="row g-3">
            <div className="col-md-4"><img src={analyzeTradeController} className="img-fluid rounded shadow" alt="Analyze Controller" /></div>
            <div className="col-md-4"><img src={sentimentData} className="img-fluid rounded shadow" alt="Sentiment Data" /></div>
            <div className="col-md-4"><img src={congressionalActivity} className="img-fluid rounded shadow" alt="Congressional Activity" /></div>
            <div className="col-md-12"><img src={congressionalDetails} className="img-fluid rounded shadow" alt="Congressional Details" /></div>
          </div>
        </section>

        {/* 📦 Step 3 — Enrich Ticker Data */}
        <section className="mb-5">
          <h3 className="fs-4 fw-bold">3️⃣ Enrich Ticker with Data</h3>
          <p>We enrich the ticker with pricing, technical indicators, sentiment scores, and political trading history.</p>
          <div className="row g-3">
            <div className="col-md-3"><img src={enrichingTicker} className="img-fluid rounded shadow" alt="Enriching Ticker" /></div>
            <div className="col-md-3"><img src={ObjectEnrichment} className="img-fluid rounded shadow" alt="Object Enrichment" /></div>
            <div className="col-md-3"><img src={perValidated} className="img-fluid rounded shadow" alt="Prevalidated Snapshot" /></div>
            <div className="col-md-3"><img src={FullEnrichment} className="img-fluid rounded shadow" alt="Full Enrichment" /></div>
          </div>
        </section>

        {/* ✍️ Step 4 — Construct GPT Prompt */}
        <section className="mb-5">
          <h3 className="fs-4 fw-bold">4️⃣ Construct GPT Prompt</h3>
          <p>We format a structured prompt to guide GPT in analyzing the data and generating a recommendation.</p>
          <div className="row g-3">
            <div className="col-md-2"><img src={promptSetup1} className="img-fluid rounded shadow" alt="Prompt Step 1" /></div>
            <div className="col-md-2"><img src={promptSetup2} className="img-fluid rounded shadow" alt="Prompt Step 2" /></div>
            <div className="col-md-2"><img src={promptSetup3} className="img-fluid rounded shadow" alt="Prompt Step 3" /></div>
            <div className="col-md-2"><img src={promptSetup4} className="img-fluid rounded shadow" alt="Prompt Step 4" /></div>
            <div className="col-md-2"><img src={promptSetup5} className="img-fluid rounded shadow" alt="Prompt Step 5" /></div>
          </div>
        </section>

        {/* ☁️ Step 5 — Save & Display */}
        <section className="mb-5">
          <h3 className="fs-4 fw-bold">5️⃣ Save to MongoDB & Display to Users</h3>
          <p>Once generated, the response is saved to MongoDB and displayed transparently to the user in the app UI.</p>
          <div className="row g-3">
            <div className="col-md-6"><img src={gptResponse} className="img-fluid rounded shadow" alt="GPT Raw Output" /></div>
            <div className="col-md-6"><img src={finalGptResponse} className="img-fluid rounded shadow" alt="Final Displayed Output" /></div>
          </div>
        </section>

        {/* 🔁 Step 6 — Cron Monitoring */}
        <section className="mb-5">
          <h3 className="fs-4 fw-bold">6️⃣ Cron Job Monitoring</h3>
          <p>We monitor trade expiry using a cron job and track win/loss to improve recommendations over time.</p>
          <div className="text-center">
            <img src={CronJob} className="img-fluid rounded shadow" alt="Cron Job Monitoring" />
          </div>
        </section>

        {/* 🚀 What's Next */}
        <section className="mb-5">
          <h3 className="fs-4 fw-bold">🚀 What’s Next</h3>
          <ul className="text-start">
            <li><strong>📡 RAG (Retrieval-Augmented Generation):</strong> to enhance explainability and source trust.</li>
            <li><strong>📲 AWS SMS Notifications:</strong> for alerts on new entries and exit signals.</li>
            <li><strong>🔐 Google Auth:</strong> deferred sign-in and user tracking for trade history and security.</li>
            <li><strong>📊 Stakeholder Transparency:</strong> mode to visualize all internal decision steps in real time.</li>
          </ul>
        </section>
      </main>
    </Layout>
  );
};

export default MarketPage;
