declare module "mockjs" {
  const Mock: {
    mock: (url: string | RegExp, method: string, template: any) => void;
    setup: (config: any) => void;
    Random: any;
    valid: (template: any, data: any) => boolean;
    toJSONSchema: (template: any) => any;
    version: string;
  };
  export default Mock;
}
