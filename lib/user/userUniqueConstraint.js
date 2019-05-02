
class UserUniqueConstraint {
  constructor(columns) {
    this.columns = columns;
  }
  add(column) {
    this.columns.push(column);
  }
}
