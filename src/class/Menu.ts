export default class Menu {
  Id = "";
  Name = "";
  Index = "";
  FilePath = "";
  ParentId = "";
  Order = 0;
  IsEnable = true;
  Icon = "";
  Description = "";
  Children: Array<Menu> = [];
}
