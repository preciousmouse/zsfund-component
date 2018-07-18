using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ZSFundComponent.Entity.ResponseEntity;

namespace ZSFundComponent.Controllers
{
    [Produces("application/json")]
    [Route("api/Org")]
    public class CompanyController : Controller
    {
        // GET: api/Org
        [HttpGet("Children")]
        public List<CompanyInfo> Children(string id = "04259cac-8ece-4da2-b362-5b9f27f46b7d", int type = 0)
        {
            //模拟取得数据，此处调用api
            List<CompanyInfo> nodes = new List<CompanyInfo> {
                new CompanyInfo{
                    id = "71dc2d66-d9a3-4b24-a819-1d32dbe6cc9c",
                    loginName = null,
                    displayName = "公司领导",
                    email = null,
                    officePhone = null,
                    mobile = null,
                    title = null,
                    department = null,
                    unitType = 8,
                    enabled = true,
                    parentId = "04259cac-8ece-4da2-b362-5b9f27f46b7d"
                },
                new CompanyInfo{
                    id = "8b6da52c-c257-40e6-aec4-03c9470c959a",
                    loginName = null,
                    displayName = "领导子层",
                    email = null,
                    officePhone = null,
                    mobile = null,
                    title = null,
                    department = null,
                    unitType = 8,
                    enabled = true,
                    parentId = "71dc2d66-d9a3-4b24-a819-1d32dbe6cc9c"
                },
                new CompanyInfo{
                    id = "8d4f0e19-8355-43c6-b49d-20c7c44774c3",
                    loginName = "gengxiaoping",
                    displayName = "耿小平",
                    email = "gengxiaoping@zsfund.com",
                    officePhone = "28191899",
                    mobile = "13905812368",
                    title = "董秘",
                    department = "公司领导",
                    unitType = 1,
                    enabled = true,
                    parentId = "71dc2d66-d9a3-4b24-a819-1d32dbe6cc9c"
                },
                new CompanyInfo{
                    id = "C29973E1-4F1B-4CE4-A413-4FF76A3DC32F",
                    loginName = "guoleqi",
                    displayName = "郭乐琦",
                    email = "guoleqi@zsfund.com",
                    officePhone = "60350812",
                    mobile = "13671618308",
                    title = "督察长",
                    department = "领导子层",
                    unitType = 1,
                    enabled = true,
                    parentId = "8b6da52c-c257-40e6-aec4-03c9470c959a"
                }
            };

            List<CompanyInfo> ans = new List<CompanyInfo> { };
            if (type != 1){//8
                ans.AddRange(nodes.Where(
                    f => (
                        f.parentId == id &&
                        f.unitType == 8)).ToList());
            }
            if (type != 8){//1
                ans.AddRange(nodes.Where(
                    f => (
                        f.parentId == id &&
                        f.unitType == 1)).ToList());
            }
            return ans;
        }
    }
}
