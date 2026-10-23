
from fastapi import FastAPI
from pydantic import BaseModel
from langgraph.graph import StateGraph, START, END
from typing import TypedDict

app = FastAPI(title="RepoPilot AI Agent")


class ReviewState(TypedDict):
    code: str
    findings: list[str]


def analyze_code(state: ReviewState):
    code = state["code"]
    findings = []

    if "System.out.println(" in code:
        findings.append("Consider removing unnecessary debugging output.")

    if "TODO" in code:
        findings.append("An unfinished TODO task was found.")

    if not findings:
        findings.append("No basic review patterns detected.")

    return {"findings": findings}


builder = StateGraph(ReviewState)
builder.add_node("analyze_code", analyze_code)
builder.add_edge(START, "analyze_code")
builder.add_edge("analyze_code", END)

review_graph = builder.compile()


class ReviewRequest(BaseModel):
    code: str


@app.get("/health")
def health():
    return {
        "status": "success",
        "message": "RepoPilot AI Agent is running!"
    }


@app.post("/review")
def review(request: ReviewRequest):
    result = review_graph.invoke({
        "code": request.code,
        "findings": []
    })

    return {
        "status": "success",
        "findings": result["findings"],
        "findingCount": len(result["findings"])
    }
