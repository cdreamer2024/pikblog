export default interface TreeModel {
  Id: string;
  Index: string;
  Name: string;
  Icon: string;
  FilePath: string;
  Children: Array<TreeModel>;
}
