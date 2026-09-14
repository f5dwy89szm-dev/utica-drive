from __future__ import annotations

import pandas as pd
import streamlit as st
from agent import scan

st.set_page_config(page_title="Crypto Sentinel AI", page_icon="📡", layout="wide")

st.title("📡 Crypto Sentinel AI")
st.caption("Research agent for established coins + newly listed DEX tokens. It does not execute trades and cannot guarantee profit.")

with st.sidebar:
    st.header("Scan settings")
    established = st.slider("Established coins", 25, 250, 100, 25)
    new_tokens = st.slider("Newest token profiles", 5, 40, 20, 5)
    max_risk = st.slider("Max risk to display", 20, 100, 85, 5)
    min_opportunity = st.slider("Min opportunity score", 0, 100, 35, 5)
    run = st.button("Run market scan", type="primary", use_container_width=True)
    st.markdown("**How to read it**\n\nOpportunity = observable setup strength.\n\nRisk = market-structure danger.\n\nConfidence = how complete the available data is.")

if "results" not in st.session_state:
    st.session_state.results = None
    st.session_state.errors = []

if run or st.session_state.results is None:
    with st.spinner("Scanning market data..."):
        st.session_state.results, st.session_state.errors = scan(established, new_tokens)

results = st.session_state.results or []
errors = st.session_state.errors
if errors:
    for e in errors:
        st.warning(e)

filtered = [r for r in results if r.risk_score <= max_risk and r.opportunity_score >= min_opportunity]

if not filtered:
    st.info("No assets match the current filters. Lower the opportunity threshold or raise max risk.")
    st.stop()

rows = []
for r in filtered:
    a = r.asset
    rows.append({
        "Asset": f"{a.name} ({a.symbol})",
        "Source": a.source,
        "Chain": a.chain or "—",
        "Price $": a.price_usd,
        "24h %": a.change_24h,
        "7d %": a.change_7d,
        "24h Volume $": a.volume_24h,
        "Liquidity $": a.liquidity_usd,
        "Opportunity": r.opportunity_score,
        "Risk": r.risk_score,
        "Confidence": r.confidence,
        "Signal": r.label,
    })

df = pd.DataFrame(rows)

c1, c2, c3 = st.columns(3)
c1.metric("Assets scanned", len(results))
c2.metric("Matching filters", len(filtered))
c3.metric("High-risk filtered", sum(r.risk_score > max_risk for r in results))

st.subheader("Ranked market view")
st.dataframe(df, use_container_width=True, hide_index=True)

st.subheader("Top explanations")
for r in filtered[:12]:
    a = r.asset
    with st.expander(f"{a.name} ({a.symbol}) — {r.label} | Opportunity {r.opportunity_score} / Risk {r.risk_score}"):
        st.write(f"**Confidence:** {r.confidence}%")
        if a.url:
            st.link_button("Open market page", a.url)
        st.markdown("**Positive evidence**")
        for x in r.reasons:
            st.write("•", x)
        st.markdown("**Risk flags**")
        for x in r.warnings:
            st.write("•", x)
        if a.address:
            st.code(a.address, language=None)

st.divider()
st.caption("Important: This tool is for research/education, not personalized financial advice. New tokens can be scams, rug pulls, or become illiquid without warning. Never risk money you cannot afford to lose.")
