const request = require("supertest");
const app = require("../app");
const DOMChange = require("../models/Layer");
const { sanitizeElementChanges } = require("../utils");

jest.mock("../models/Layer");
jest.mock("../config/db", () => jest.fn());
jest.mock("../utils", () => ({
  sanitizeElementChanges: jest.fn((changes) => changes),
}));

describe("Layer Controller", () => {
  const apiPaths = {
    googleId: "/api/layers/google/test-google-id",
    url: "/api/layers/url/http%3A%2F%2Ftest.com",
    checkCustomName: "/api/layers/check/test-custom-name",
    saveLayer: "/api/layers/save",
    deleteLayer: "/api/layers/delete/test-id",
  };
  const mockData = {
    userId: "test-user",
    url: "http://test.com",
    customName: "test",
    elementChanges: [],
  };
  const mockError = new Error("Some error");

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("GET /api/layers/google/:googleId", () => {
    it("Google ID로 커스텀 레이아웃을 조회하고 상태 코드 200을 반환해야 합니다", async () => {
      DOMChange.find.mockResolvedValue([mockData]);

      const response = await request(app).get(apiPaths.googleId).expect(200);

      expect(DOMChange.find).toHaveBeenCalledWith({ userId: "test-google-id" });
      expect(response.body).toEqual([mockData]);
    });

    it("실패 시 에러 응답을 반환해야 합니다", async () => {
      await testErrorResponse("get", apiPaths.googleId);
    });
  });

  describe("GET /api/layers/url/:url", () => {
    it("URL과 사용자 ID로 커스텀 레이아웃을 조회하고 상태 코드 200을 반환해야 합니다", async () => {
      DOMChange.find.mockResolvedValue([mockData]);

      const response = await request(app)
        .get(apiPaths.url)
        .query({ userId: "test-user" })
        .expect(200);

      expect(DOMChange.find).toHaveBeenCalledWith({
        url: "http://test.com",
        userId: "test-user",
      });
      expect(response.body).toEqual([mockData]);
    });

    it("실패 시 에러 응답을 반환해야 합니다", async () => {
      await testErrorResponse("get", apiPaths.url, { userId: "test-user" });
    });
  });

  describe("GET /api/layers/check/:customName", () => {
    it("커스텀 이름의 존재 여부를 상태 코드 200과 함께 반환해야 합니다", async () => {
      DOMChange.findOne.mockResolvedValue(mockData);

      const response = await request(app)
        .get(apiPaths.checkCustomName)
        .expect(200);

      expect(DOMChange.findOne).toHaveBeenCalledWith({
        customName: "test-custom-name",
      });
      expect(response.body).toEqual({ exists: true });
    });

    it("커스텀 이름이 없을 경우 상태 코드 200과 존재하지 않음을 반환해야 합니다", async () => {
      DOMChange.findOne.mockResolvedValue(null);

      const response = await request(app)
        .get(apiPaths.checkCustomName)
        .expect(200);

      expect(response.body).toEqual({ exists: false });
    });
  });

  describe("POST /api/layers/save", () => {
    it("커스텀 레이아웃을 저장하고 상태 코드 201을 반환해야 합니다", async () => {
      DOMChange.create.mockResolvedValue(mockData);

      const response = await request(app)
        .post(apiPaths.saveLayer)
        .send(mockData)
        .expect(201);

      expect(sanitizeElementChanges).toHaveBeenCalledWith(
        mockData.elementChanges
      );

      expect(DOMChange.create).toHaveBeenCalledWith({
        ...mockData,
        elementChanges: mockData.elementChanges,
      });
      expect(response.body).toEqual(mockData);
    });

    it("실패 시 에러 응답을 반환해야 합니다", async () => {
      await testErrorResponse("post", apiPaths.saveLayer, mockData);
    });
  });

  describe("DELETE /api/layers/delete/:id", () => {
    it("커스텀 레이아웃을 삭제하고 상태 코드 200을 반환해야 합니다", async () => {
      DOMChange.findByIdAndDelete.mockResolvedValue({ _id: "test-id" });

      const response = await request(app)
        .delete(apiPaths.deleteLayer)
        .expect(200);

      expect(DOMChange.findByIdAndDelete).toHaveBeenCalledWith("test-id");
      expect(response.body).toEqual({
        message: "DOM 변경이 성공적으로 삭제되었습니다",
      });
    });

    it("ID를 찾지 못할 경우 상태 코드 404를 반환해야 합니다", async () => {
      DOMChange.findByIdAndDelete.mockResolvedValue(null);

      const response = await request(app)
        .delete(apiPaths.deleteLayer)
        .expect(404);

      expect(response.body).toEqual({ message: "DOM 변경을 찾을 수 없습니다" });
    });

    it("실패 시 에러 응답을 반환해야 합니다", async () => {
      await testErrorResponse("delete", apiPaths.deleteLayer);
    });
  });

  async function testErrorResponse(method, path, payload = {}) {
    if (method === "delete") {
      DOMChange.findByIdAndDelete.mockRejectedValue(mockError);
    } else {
      DOMChange[method === "post" ? "create" : "find"].mockRejectedValue(
        mockError
      );
    }

    const response = await request(app)[method](path).send(payload).expect(500);
    expect(response.body).toHaveProperty("message");
  }
});
