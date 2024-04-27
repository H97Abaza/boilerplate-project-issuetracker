const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  const issue_title = "Test Title";
  const issue_text = "Test Text";
  const created_by = "Tester";
  const assigned_to = "Tester1";
  const status_text = "To Test";
  const all_fields = {
    issue_title,
    issue_text,
    created_by,
    assigned_to,
    status_text,
  };
  const post_required_fields = { issue_title, issue_text, created_by };
  const post_missing_required_fields = { issue_title, issue_text };
  let _id;
  const issue_fields = [
    "assigned_to",
    "status_text",
    "open",
    "_id",
    "issue_title",
    "issue_text",
    "created_by",
    "created_on",
    "updated_on",
  ];
  // #1
  test("Create an issue with every field: POST request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/apitest")
      .send(all_fields)
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        Object.keys(all_fields).forEach((field) => {
          assert.propertyVal(res.body, field, all_fields[field]);
        });
        done();
      });
  });

  // #2
  test("Create an issue with only required fields: POST request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/apitest")
      .send(post_required_fields)
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        Object.keys(post_required_fields).forEach((field) => {
          assert.propertyVal(res.body, field, post_required_fields[field]);
        });
        assert.property(res.body, "_id");
        _id = res.body._id;
        done();
      });
  });

  // #3
  test("Create an issue with missing required fields: POST request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/apitest")
      .send(post_missing_required_fields)
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.deepEqual(res.body, { error: "required field(s) missing" });
        done();
      });
  });

  // #4
  test("View issues on a project: GET request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .keepOpen()
      .get("/api/issues/apitest")
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        issue_fields.forEach((field) => {
          assert.property(res.body[0], field);
        });
        done();
      });
  });

  // #5
  test("View issues on a project with one filter: GET request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .keepOpen()
      .get("/api/issues/apitest")
      .query({ issue_title })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        res.body.forEach((issue) => {
          assert.propertyVal(issue, "issue_title", issue_title);
        });
        done();
      });
  });

  // #6
  test("View issues on a project with multiple filters: GET request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .keepOpen()
      .get("/api/issues/apitest")
      .query({ issue_title, issue_text })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        res.body.forEach((issue) => {
          assert.propertyVal(issue, "issue_title", issue_title);
          assert.propertyVal(issue, "issue_text", issue_text);
        });
        done();
      });
  });

  // #7
  test("Update one field on an issue: PUT request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .keepOpen()
      .put("/api/issues/apitest")
      .send({ _id, issue_title: "updated title" })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.deepEqual(res.body, {
          result: "successfully updated",
          _id,
        });
        done();
      });
  });

  // #8
  test("Update multiple fields on an issue: PUT request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .keepOpen()
      .put("/api/issues/apitest")
      .send({ _id, issue_title: "updated title", issue_text: "updated text" })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.deepEqual(res.body, {
          result: "successfully updated",
          _id,
        });
        done();
      });
  });

  // #9
  test("Update an issue with missing _id: PUT request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .keepOpen()
      .put("/api/issues/apitest")
      .send({})
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.deepEqual(res.body, { error: "missing _id" });
        done();
      });
  });

  // #10
  test("Update an issue with no fields to update: PUT request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .keepOpen()
      .put("/api/issues/apitest")
      .send({ _id })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.deepEqual(res.body, {
          error: "no update field(s) sent",
          _id,
        });
        done();
      });
  });

  // #11
  test("Update an issue with an invalid _id: PUT request to /api/issues/{project}", (done) => {
    invalid_id = _id.replace(/.{5}$/, "00000");
    chai
      .request(server)
      .keepOpen()
      .put("/api/issues/apitest")
      .send({ _id: invalid_id, issue_title })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.deepEqual(res.body, {
          error: "could not update",
          _id: invalid_id,
        });
        done();
      });
  });

  // #12
  test("Delete an issue: DELETE request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .keepOpen()
      .delete("/api/issues/apitest")
      .send({ _id })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.deepEqual(res.body, { result: "successfully deleted", _id });
        done();
      });
  });

  // #13
  test("Delete an issue with an invalid _id: DELETE request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .keepOpen()
      .delete("/api/issues/apitest")
      .send({ _id })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.deepEqual(res.body, {
          error: "could not delete",
          _id,
        });
        done();
      });
  });

  // #14
  test("Delete an issue with missing _id: DELETE request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .keepOpen()
      .delete("/api/issues/apitest")
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.deepEqual(res.body, {
          error: "missing _id",
        });
        done();
      });
  });
});
