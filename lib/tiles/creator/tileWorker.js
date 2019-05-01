import ProjectTile from './projectTile'

function tileWorker(e) {
  console.log('Tile Worker - working');
  console.time('Tile Worker - time');
  var self = this;
  var job = e.data;

  ProjectTile(job, function(err, data) {
    postMessage(data);
    self.close();
  });
}

export default function(self) {
  self.onmessage = tileWorker;
  self.onerror = function(e) {
    console.log('error', e);
  }
};
