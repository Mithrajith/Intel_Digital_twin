"""Tests for the Technovate backend API."""
import pytest
from fastapi.testclient import TestClient
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.main import app

client = TestClient(app)


def test_root():
    """Test root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "name" in data
    assert "version" in data
    assert "endpoints" in data


def test_machine_meta():
    """Test machine metadata endpoint."""
    response = client.get("/machine/meta")
    assert response.status_code == 200
    data = response.json()
    assert data["machine_id"] == "armpi_fpv_01"
    assert data["machine_type"] == "robotic_arm"
    assert data["num_joints"] > 0
    assert len(data["joints"]) > 0
    assert len(data["links"]) > 0
    
    # Check joint structure
    joint = data["joints"][0]
    assert "name" in joint
    assert "type" in joint
    assert "axis" in joint
    assert "lower_limit" in joint
    assert "upper_limit" in joint


def test_machine_state():
    """Test machine state endpoint."""
    response = client.get("/machine/state")
    assert response.status_code == 200
    data = response.json()
    assert data["machine_id"] == "armpi_fpv_01"
    assert "timestamp" in data
    assert "status" in data
    assert "uptime_seconds" in data
    assert len(data["joints"]) > 0
    assert "vibration_level" in data
    
    # Check joint state structure
    joint = data["joints"][0]
    assert "name" in joint
    assert "angle" in joint
    assert "velocity" in joint
    assert "torque" in joint
    assert "temperature" in joint


def test_machine_health():
    """Test machine health endpoint."""
    response = client.get("/machine/health")
    assert response.status_code == 200
    data = response.json()
    assert data["machine_id"] == "armpi_fpv_01"
    assert "timestamp" in data
    assert "anomaly_score" in data
    assert "failure_probability" in data
    assert "rul_hours" in data
    assert "health_status" in data
    assert "alerts" in data
    assert "component_health" in data
    
    # Check value ranges
    assert 0 <= data["anomaly_score"] <= 1
    assert 0 <= data["failure_probability"] <= 1
    assert data["rul_hours"] >= 0
    assert data["health_status"] in ["healthy", "warning", "critical"]


def test_machine_control_reset():
    """Test machine control endpoint - reset command."""
    response = client.post(
        "/machine/control",
        json={"command": "reset"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "message" in data
    assert "timestamp" in data


def test_machine_control_invalid():
    """Test machine control endpoint - invalid command."""
    response = client.post(
        "/machine/control",
        json={"command": "invalid_command"}
    )
    assert response.status_code == 400


def test_logs_export():
    """Test logs export endpoint."""
    # Wait a bit for some logs to accumulate
    import time
    time.sleep(2)
    
    response = client.get("/logs/export")
    
    # Should either return CSV or 404 if no logs yet
    assert response.status_code in [200, 404]
    
    if response.status_code == 200:
        assert response.headers["content-type"] == "text/csv; charset=utf-8"
        assert "Content-Disposition" in response.headers


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
