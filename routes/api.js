"use strict";
const mongoose = require("mongoose");
module.exports = function (app) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then((mongoose) => {
      console.log("Connected to DB");
    })
    .catch((err) => {
      console.log("Error! Not connected to DB:\n", err);
    });

  const issueSchema = new mongoose.Schema(
    {
      assigned_to: { type: String, default: "" },
      status_text: { type: String, default: "" },
      open: { type: Boolean, default: true },
      issue_title: { type: String, required: true },
      issue_text: { type: String, required: true },
      created_by: { type: String, required: true },
      created_on: { type: Date, default: Date.now },
      updated_on: { type: Date, default: Date.now },
      project: {
        type: String,
        select: false,
        required: true,
      },
    },
    { versionKey: false }
  );
  const Issue = new mongoose.model("Issue", issueSchema);
  app
    .route("/api/issues/:project")
    .get(function (req, res) {
      let project = req.params.project;
      let filters = req.query;
      console.log({ project, ...filters });
      Issue.find({ project, ...filters })
        .then((docs) => res.json(docs))
        .catch((err) => {
          console.log(err);
          res.json(err);
        });
    })
    .post(function (req, res) {
      let project = req.params.project;
      console.log({ post: req.body });
      let issue = new Issue({...req.body,project});
      issue
        .save()
        .then((doc) => {
          console.log({ doc });
          res.json(doc);
        })
        .catch((err) => {
          console.log({ err: JSON.stringify(err) });
          if (err.toString().match("is required"))
            return res.json({ error: "required field(s) missing" });
          res.json(err);
        });
    })
    .put(function (req, res) {
      let project = req.params.project;
      let { _id, ...issue } = req.body;
      if (!_id) return res.json({ error: "missing _id" });
      if (Object.keys(issue).length === 0)
        return res.json({ error: "no update field(s) sent", _id: _id });
      Issue.findOneAndUpdate(
        { project, _id },
        {
          $set: {
            ...issue,
            updated_on: new Date(),
          },
        }
      )
        .then((doc) => {
          if (doc) res.json({ result: "successfully updated", _id });
          else res.json({ error: "could not update", _id });
        })
        .catch((err) => {
          console.log(err);
          res.json({ error: "could not update", _id });
        });
    })
    .delete(function (req, res) {
      let project = req.params.project;
      let _id = req.body._id;
      if (!_id) return res.json({ error: "missing _id" });
      Issue.findOneAndDelete({ project, _id })
        .then((doc) => {
          if (doc) res.json({ result: "successfully deleted", _id });
          else res.json({ error: "could not delete", _id });
        })
        .catch((err) => {
          res.json({ error: "could not delete", _id });
        });
    });
};
