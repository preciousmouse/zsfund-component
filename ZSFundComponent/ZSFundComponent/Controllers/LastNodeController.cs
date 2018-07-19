using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ZSFundComponent.Entity.ResponseEntity;

namespace ZSFundComponent.Controllers
{
    [Produces("application/json")]
    [Route("api/User")]
    public class LastNodeController : Controller
    {
        // GET: api/User
        [HttpGet("LastNodes")]
        public string LastNodes(string id="")
        {
            //var idList = "C29973E1-4F1B-4CE4-A413-4FF76A3DC32F";//api 获得id列表

            string[] idList = {"8d4f0e19-8355-43c6-b49d-20c7c44774c3"};
            return string.Join(";",idList);
        }
    }
}
